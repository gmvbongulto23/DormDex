from datetime import datetime, timedelta

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client():
    from main import app

    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def db_session():
    from database import Base, SessionLocal, engine

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


def make_review(db, *, verified=False, code_expires_at=None, verify_attempts=0, created_at=None):
    from models import Listing, Review

    listing = Listing(
        name="Cleanup Test House",
        address="1 Campus Way",
        lat=37.65,
        lng=-122.05,
        rent=1500,
        bedrooms=1,
        landlord_name="Test Landlord",
        safety_score=7,
        distance_miles=1,
    )
    db.add(listing)
    db.flush()
    review = Review(
        listing_id=listing.id,
        email="student@csueastbay.edu",
        overall_rating=4,
        landlord_rating=4,
        maintenance_rating=4,
        safety_rating=4,
        monthly_utilities=100,
        text="A sufficiently long review for the verification test.",
        created_at=created_at or datetime.utcnow(),
        verified=verified,
        code_hash="old-hash",
        code_expires_at=code_expires_at,
        verify_attempts=verify_attempts,
    )
    db.add(review)
    db.commit()
    return review


def test_resend_code_returns_404_for_missing_review(client, db_session):
    response = client.post("/reviews/99999/resend-code")

    assert response.status_code == 404


def test_resend_code_returns_400_for_verified_review(client, db_session):
    review = make_review(db_session, verified=True)

    response = client.post(f"/reviews/{review.id}/resend-code")

    assert response.status_code == 400


def test_resend_code_enforces_60_second_cooldown(client, db_session):
    sent_at = datetime.utcnow() - timedelta(seconds=30)
    review = make_review(
        db_session,
        code_expires_at=sent_at + timedelta(minutes=15),
    )

    response = client.post(f"/reviews/{review.id}/resend-code")

    assert response.status_code == 429


def test_resend_code_reissues_and_resets_attempts(client, db_session):
    sent_at = datetime.utcnow() - timedelta(seconds=61)
    review = make_review(
        db_session,
        code_expires_at=sent_at + timedelta(minutes=15),
        verify_attempts=4,
    )

    response = client.post(f"/reviews/{review.id}/resend-code")

    assert response.status_code == 200
    result = response.json()
    assert result["email_mode"] == "demo"
    assert result["demo_code"].isdigit()
    db_session.refresh(review)
    assert review.verify_attempts == 0
    assert review.code_hash != "old-hash"
    assert review.code_expires_at > datetime.utcnow()

    verify_response = client.post(
        f"/reviews/{review.id}/verify",
        json={"code": result["demo_code"]},
    )
    assert verify_response.status_code == 200


def test_resend_code_omits_demo_code_when_email_mode(client, db_session, monkeypatch):
    import verification

    review = make_review(db_session)
    monkeypatch.setattr(verification.mailer, "DEMO_MODE", False)
    monkeypatch.setattr(verification.mailer, "send_code", lambda *args: None)

    response = client.post(f"/reviews/{review.id}/resend-code")

    assert response.status_code == 200
    assert response.json()["email_mode"] == "email"
    assert "demo_code" not in response.json()


def test_cleanup_deletes_25_hour_unverified_only(db_session):
    from cleanup import delete_stale_unverified
    from models import Review

    old_pending = make_review(db_session, created_at=datetime.utcnow() - timedelta(hours=25))
    recent_pending = make_review(db_session, created_at=datetime.utcnow() - timedelta(hours=23))
    old_verified = make_review(
        db_session,
        verified=True,
        created_at=datetime.utcnow() - timedelta(hours=25),
    )
    old_pending_id = old_pending.id
    recent_pending_id = recent_pending.id
    old_verified_id = old_verified.id

    deleted = delete_stale_unverified(db_session)

    assert deleted == 1
    assert db_session.get(Review, old_pending_id) is None
    assert db_session.get(Review, recent_pending_id) is not None
    assert db_session.get(Review, old_verified_id) is not None