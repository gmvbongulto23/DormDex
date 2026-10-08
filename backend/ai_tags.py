"""Review-based listing tags with a keyword and rating fallback."""
import json
import os

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ai import MODEL
from database import get_db
from models import Listing, Review

router = APIRouter()


class TagsOutput(BaseModel):
    tags: list[str] = Field(min_length=3, max_length=5)


TAG_RULES = (
    ("Responsive landlord", ("landlord replies within a day", "replies fast", "quickly got back")),
    ("Fast maintenance", ("fixed our sink fast", "fixed issues fast")),
    ("Quiet building", ("quiet building",)),
    ("Walkable location", ("walkable to the shuttle",)),
    ("Notice before entry", ("gives notice before entering", "gives proper notice", "gives notice")),
    ("Feels safe", ("i feel safe", "feeling safe", "locked front gate", "secure gates")),
    ("Deposit returned", ("deposit returned in full", "returns deposits in full")),
    ("Thin walls", ("walls are thin",)),
    ("High winter utilities", ("bill spikes in dec-feb", "bill spikes",)),
    ("Slow maintenance", ("maintenance is slow", "took a week to fix", "never properly fixed")),
    ("Limited street parking", ("street parking only", "fills up after 6 pm")),
    ("Mold concerns", ("mold in the bathroom", "mold untreated")),
    ("Deposit withheld", ("kept part of the deposit", "kept parts of the deposit")),
    ("Safety concerns", ("package theft", "door lock is broken", "entry door lock is broken")),
    ("Unresponsive landlord", ("hard to reach the landlord", "three weeks to get a response", "slow to respond")),
)


def _rating_tags(reviews):
    dimensions = (
        ("overall_rating", "resident feedback"),
        ("landlord_rating", "landlord"),
        ("maintenance_rating", "maintenance"),
        ("safety_rating", "safety"),
    )
    tags = []
    for field, label in dimensions:
        average = sum(getattr(review, field) for review in reviews) / len(reviews)
        if average >= 4:
            adjective = "Highly rated" if field == "overall_rating" else "Strong"
        elif average <= 2.5:
            adjective = "Low-rated" if field == "overall_rating" else "Needs attention"
        else:
            adjective = "Mixed"
        tags.append(f"{adjective} {label}")
    return tags


def _basic_tags(reviews):
    if not reviews:
        return []

    review_text = " ".join(review.text.lower() for review in reviews)
    keyword_tags = []
    for tag, phrases in TAG_RULES:
        matches = sum(review_text.count(phrase) for phrase in phrases)
        if matches:
            keyword_tags.append((matches, tag))
    keyword_tags.sort(key=lambda match: -match[0])

    tags = [tag for _, tag in keyword_tags[:5]]
    for tag in _rating_tags(reviews):
        if len(tags) == 5:
            break
        tags.append(tag)
    return tags


def _ai_tags(listing, reviews):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or not reviews:
        return None

    try:
        from google import genai

        review_text = "\n".join(
            f"- Ratings overall={review.overall_rating}/5, landlord={review.landlord_rating}/5, "
            f"maintenance={review.maintenance_rating}/5, safety={review.safety_rating}/5: {review.text}"
            for review in reviews
        )
        prompt = (
            f"Create 3 to 5 concise tags for '{listing.name}' based only on these verified student reviews. "
            "Use plain-language housing topics, avoid duplicating ideas, and do not infer facts.\n"
            f"Reviews:\n{review_text}"
        )
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config={"response_mime_type": "application/json", "response_schema": TagsOutput},
        )
        return TagsOutput.model_validate(json.loads(response.text))
    except Exception as error:
        print(f"[ai_tags] Gemini failed, using basic tags: {str(error)[:150]}")
        return None


@router.get("/listings/{listing_id}/tags")
def listing_tags(listing_id: int, db: Session = Depends(get_db)):
    listing = db.get(Listing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    reviews = (
        db.query(Review)
        .filter(Review.listing_id == listing_id, Review.verified.is_(True))
        .all()
    )
    ai_result = _ai_tags(listing, reviews)
    tags = ai_result.tags if ai_result else _basic_tags(reviews)
    return {"listing_id": listing.id, "tags": tags, "source": "ai" if ai_result else "basic"}