import os
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr, field_validator
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import Listing, Review
from ai import summarize_reviews

Base.metadata.create_all(bind=engine)

app = FastAPI(title="DormDex API", description="Know the place before you sign.")

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
    def must_be_edu(cls, v: str) -> str:
        if not v.lower().endswith(".edu"):
            raise ValueError("Please use your school .edu email")
        return v


class ReviewOut(BaseModel):
    id: int
    overall_rating: int
    landlord_rating: int
    maintenance_rating: int
    safety_rating: int
    monthly_utilities: int
    text: str
    created_at: datetime
    verified: bool = True


# ---------- Helpers ----------
def listing_stats(l: Listing) -> dict:
    reviews = l.reviews
    n = len(reviews)
    avg_util = round(sum(r.monthly_utilities for r in reviews) / n) if n else None
    avg_rating = round(sum(r.overall_rating for r in reviews) / n, 1) if n else None
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
        # If no one has reported utilities yet, true_cost = rent and utilities_estimated = True
        "true_cost": l.rent + (avg_util or 0),
        "utilities_reported": n > 0,
        "avg_rating": avg_rating,
        "review_count": n,
    }


def to_review_out(r: Review) -> dict:
    return ReviewOut(
        id=r.id, overall_rating=r.overall_rating, landlord_rating=r.landlord_rating,
        maintenance_rating=r.maintenance_rating, safety_rating=r.safety_rating,
        monthly_utilities=r.monthly_utilities, text=r.text, created_at=r.created_at,
    ).model_dump()


def get_listing_or_404(db: Session, listing_id: int) -> Listing:
    l = db.get(Listing, listing_id)
    if not l:
        raise HTTPException(status_code=404, detail="Listing not found")
    return l


# ---------- Routes ----------
@app.get("/")
def health():
    return {"status": "ok", "app": "DormDex"}


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
    data["reviews"] = [to_review_out(r) for r in l.reviews]
    data["ai_summary"] = l.ai_summary  # may be null -> frontend calls /summary
    return data


@app.get("/listings/{listing_id}/summary")
def get_summary(listing_id: int, db: Session = Depends(get_db)):
    l = get_listing_or_404(db, listing_id)
    if not l.ai_summary:
        l.ai_summary = summarize_reviews(l, l.reviews)
        db.commit()
    return {"listing_id": l.id, "ai_summary": l.ai_summary}


@app.post("/listings/{listing_id}/reviews", status_code=201)
def add_review(listing_id: int, review: ReviewIn, db: Session = Depends(get_db)):
    l = get_listing_or_404(db, listing_id)
    r = Review(listing_id=l.id, **review.model_dump())
    db.add(r)
    l.ai_summary = None  # invalidate cache; regenerated on next /summary call
    db.commit()
    db.refresh(l)
    return {"review": to_review_out(r), "listing": listing_stats(l)}
