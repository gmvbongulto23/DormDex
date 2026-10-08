import hashlib
import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Review
import mailer

router = APIRouter()
CODE_TTL = timedelta(minutes=15)
RESEND_COOLDOWN = timedelta(seconds=60)


def _hash_code(review_id: int, code: str) -> str:
    return hashlib.sha256(f"{review_id}:{code}".encode()).hexdigest()


@router.post("/reviews/{review_id}/resend-code")
def resend_review_code(review_id: int, db: Session = Depends(get_db)):
    review = db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.verified:
        raise HTTPException(status_code=400, detail="This review is already verified")

    now = datetime.utcnow()
    if review.code_expires_at:
        last_sent_at = review.code_expires_at - CODE_TTL
        if now - last_sent_at < RESEND_COOLDOWN:
            raise HTTPException(status_code=429, detail="Please wait before requesting another code.")

    code = f"{secrets.randbelow(1_000_000):06d}"
    review.code_hash = _hash_code(review.id, code)
    review.code_expires_at = now + CODE_TTL
    review.verify_attempts = 0
    try:
        mailer.send_code(review.email, code, review.listing.name)
    except RuntimeError as error:
        db.rollback()
        raise HTTPException(status_code=502, detail=str(error))
    db.commit()

    response = {
        "review_id": review.id,
        "status": "pending",
        "email_mode": "demo" if mailer.DEMO_MODE else "email",
    }
    if mailer.DEMO_MODE:
        response["demo_code"] = code
    return response