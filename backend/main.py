import hashlib
import os
import secrets
from datetime import datetime, timedelta
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr, field_validator
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import Listing, Review
from ai import summarize_reviews
import mailer
from lease import check_lease

Base.metadata.create_all(bind=engine)

app = FastAPI(title="DormDex API", description="Know the place before you sign.")

# Comma-separated, e.g. "csueastbay.edu,sjsu.edu". Subdomains like horizon.csueastbay.edu also pass.
ALLOWED_DOMAINS = [d.strip().lower() for d in os.getenv("ALLOWED_EMAIL_DOMAINS", "csueastbay.edu").split(",") if d.strip()]

CODE_TTL = timedelta(minutes=15)
MAX_ATTEMPTS = 5

# Comma-separated list, e.g. "http://localhost:5173,https://dormdex.vercel.app"
origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Schemas ----------
class ReviewIn(BaseModel):
    email: EmailStr
    overall_rating: int = Field(ge=1, le=5)
    landlord_rating: int = Field(ge=1, le=5)
    maintenance_rating: int = Field(ge=1, le=5)
    safety_rating: int = Field(ge=1, le=5)
    monthly_utilities: int = Field(ge=0, le=2000)
    text: str = Field(min_length=10, max_length=1000)

    @field_validator("email")
    @classmethod
    def must_be_school_email(cls, v: str) -> str:
        domain = v.lower().split("@")[-1]
        if not any(domain == d or domain.endswith("." + d) for d in ALLOWED_DOMAINS):
            raise ValueError(f"Please use your school email ({', '.join(ALLOWED_DOMAINS)})")
        return v.lower()


class LeaseIn(BaseModel):
    text: str = Field(min_length=50, max_length=20000)


class VerifyIn(BaseModel):
    code: str = Field(min_length=6, max_length=6, pattern=r"^\d{6}$")


class ReviewOut(BaseModel):
    id: int
    overall_rating: int
    landlord_rating: int
    maintenance_rating: int
    safety_rating: int
    monthly_utilities: int
    text: str
    created_at: datetime
    verified: bool


# ---------- Helpers ----------
def hash_code(review_id: int, code: str) -> str:
    return hashlib.sha256(f"{review_id}:{code}".encode()).hexdigest()


def listing_stats(l: Listing) -> dict:
    reviews = l.verified_reviews  # pending (unverified) reviews never count
    n = len(reviews)
    avg_util = round(sum(r.monthly_utilities for r in reviews) / n) if n else None
    avg_rating = round(sum(r.overall_rating for r in reviews) / n, 1) if n else None
    avg = lambda field: round(sum(getattr(r, field) for r in reviews) / n, 1) if n else None
    return {
        "id": l.id,
        "name": l.name,
        "address": l.address,
        "lat": l.lat,
        "lng": l.lng,
        "rent": l.rent,
        "bedrooms": l.bedrooms,
        "landlord_name": l.landlord_name,
        "safety_score": l.safety_score,
        "distance_miles": l.distance_miles,
        "avg_utilities": avg_util,
        "true_cost": l.rent + (avg_util or 0),
        "utilities_reported": n > 0,
        "avg_rating": avg_rating,
        "review_count": n,
        # Real averages from verified reviews (1-5), for the landlord scorecard
        "avg_landlord_rating": avg("landlord_rating"),
        "avg_maintenance_rating": avg("maintenance_rating"),
        "avg_safety_rating": avg("safety_rating"),
    }


def to_review_out(r: Review) -> dict:
    return ReviewOut(
        id=r.id, overall_rating=r.overall_rating, landlord_rating=r.landlord_rating,
        maintenance_rating=r.maintenance_rating, safety_rating=r.safety_rating,
        monthly_utilities=r.monthly_utilities, text=r.text, created_at=r.created_at,
        verified=r.verified,
    ).model_dump()


def get_listing_or_404(db: Session, listing_id: int) -> Listing:
    l = db.get(Listing, listing_id)
    if not l:
        raise HTTPException(status_code=404, detail="Listing not found")
    return l


# ---------- Routes ----------
@app.get("/")
def health():
    return {"status": "ok", "app": "DormDex", "email_mode": "demo" if mailer.DEMO_MODE else "email"}


@app.get("/listings")
def list_listings(
    max_cost: Optional[int] = Query(None, description="Max true monthly cost (rent + utilities)"),
    min_safety: Optional[float] = Query(None, ge=0, le=10),
    bedrooms: Optional[int] = Query(None, ge=0),
    sort: str = Query("true_cost", pattern="^(true_cost|safety|rating|distance)$"),
    db: Session = Depends(get_db),
):
    results = [listing_stats(l) for l in db.query(Listing).all()]
    if max_cost is not None:
        results = [r for r in results if r["true_cost"] <= max_cost]
    if min_safety is not None:
        results = [r for r in results if r["safety_score"] >= min_safety]
    if bedrooms is not None:
        results = [r for r in results if r["bedrooms"] == bedrooms]

    key = {
        "true_cost": lambda r: r["true_cost"],
        "safety": lambda r: -r["safety_score"],
        "rating": lambda r: -(r["avg_rating"] or 0),
        "distance": lambda r: r["distance_miles"],
    }[sort]
    return sorted(results, key=key)


@app.get("/listings/{listing_id}")
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    l = get_listing_or_404(db, listing_id)
    data = listing_stats(l)
    data["reviews"] = [to_review_out(r) for r in l.verified_reviews]
    data["ai_summary"] = l.ai_summary  # may be null -> frontend calls /summary
    return data


@app.get("/listings/{listing_id}/summary")
def get_summary(listing_id: int, db: Session = Depends(get_db)):
    l = get_listing_or_404(db, listing_id)
    if not l.ai_summary:
        l.ai_summary = summarize_reviews(l, l.verified_reviews)
        db.commit()
    return {"listing_id": l.id, "ai_summary": l.ai_summary}


@app.post("/listings/{listing_id}/reviews", status_code=201)
def add_review(listing_id: int, review: ReviewIn, db: Session = Depends(get_db)):
    """Step 1: save the review as PENDING and email a 6-digit code. It doesn't count until verified."""
    l = get_listing_or_404(db, listing_id)
    r = Review(listing_id=l.id, verified=False, **review.model_dump())
    db.add(r)
    db.flush()  # gives r.id

    code = f"{secrets.randbelow(1_000_000):06d}"
    r.code_hash = hash_code(r.id, code)
    r.code_expires_at = datetime.utcnow() + CODE_TTL
    try:
        mailer.send_code(r.email, code, l.name)
    except RuntimeError as e:
        db.rollback()
        raise HTTPException(status_code=502, detail=str(e))
    db.commit()

    body = {"review_id": r.id, "status": "pending", "email_mode": "demo" if mailer.DEMO_MODE else "email"}
    if mailer.DEMO_MODE:
        body["demo_code"] = code  # only when email sending is off; the UI labels this "Demo mode"
    return body


@app.post("/reviews/{review_id}/verify")
def verify_review(review_id: int, body: VerifyIn, db: Session = Depends(get_db)):
    """Step 2: check the code. On success the review counts toward costs, ratings and the AI summary."""
    r = db.get(Review, review_id)
    if not r:
        raise HTTPException(status_code=404, detail="Review not found")
    if r.verified:
        raise HTTPException(status_code=400, detail="This review is already verified")
    if r.verify_attempts >= MAX_ATTEMPTS:
        raise HTTPException(status_code=429, detail="Too many wrong codes. Please submit your review again.")
    if not r.code_expires_at or datetime.utcnow() > r.code_expires_at:
        raise HTTPException(status_code=400, detail="This code expired. Please submit your review again.")

    if not secrets.compare_digest(hash_code(r.id, body.code), r.code_hash or ""):
        r.verify_attempts += 1
        db.commit()
        left = MAX_ATTEMPTS - r.verify_attempts
        raise HTTPException(status_code=400, detail=f"Wrong code. {left} attempt{'s' if left != 1 else ''} left.")

    r.verified = True
    r.code_hash = None
    r.listing.ai_summary = None  # regenerated on the next /summary call
    db.commit()
    db.refresh(r.listing)
    return {"review": to_review_out(r), "listing": listing_stats(r.listing)}


@app.post("/lease/check")
def lease_check(body: LeaseIn):
    """AI lease checker: red flags, costs and questions to ask. Nothing is saved."""
    return check_lease(body.text)
