import mailer
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


def test_listing_tags_use_verified_reviews_in_basic_mode(client, db_session):
    from models import Listing, Review

    listing = Listing(
        name="Test House",
        address="1 Campus Way",
        lat=37.65,
        lng=-122.05,
        rent=1500,
        bedrooms=1,
        landlord_name="Test Landlord",
        safety_score=7,
        distance_miles=1,
    )
    db_session.add(listing)
    db_session.flush()
    db_session.add_all([
        Review(
            listing_id=listing.id,
            email="verified@csueastbay.edu",
            overall_rating=5,
            landlord_rating=5,
            maintenance_rating=5,
            safety_rating=5,
            monthly_utilities=100,
            text="Deposit returned in full, no drama at move-out. Quiet building, great for studying.",
            verified=True,
        ),
        Review(
            listing_id=listing.id,
            email="pending@csueastbay.edu",
            overall_rating=1,
            landlord_rating=1,
            maintenance_rating=1,
            safety_rating=1,
            monthly_utilities=100,
            text="Mold in the bathroom that was never properly fixed.",
            verified=False,
        ),
    ])
    db_session.commit()

    response = client.get(f"/listings/{listing.id}/tags")

    assert response.status_code == 200
    result = response.json()
    assert result["source"] == "basic"
    assert 3 <= len(result["tags"]) <= 5
    assert "Deposit returned" in result["tags"]
    assert "Mold concerns" not in result["tags"]


def test_lease_compare_uses_basic_check_without_gemini(client):
    response = client.post("/lease/compare", json={
        "lease_a": "The tenant pays a non-refundable cleaning fee of $500. Utilities are not included in rent.",
        "lease_b": "Rent is due on the first of each month. Utilities are included in rent, and the full deposit is returned after move-out.",
    })

    assert response.status_code == 200
    result = response.json()
    assert result["source"] == "basic"
    assert any(flag["title"] == "Non-refundable charge" for flag in result["lease_a"]["red_flags"])
    assert result["lease_b"]["red_flags"] == []
    assert "Lease B" in result["recommendation"]


def test_mailer_is_in_demo_mode():
    assert mailer.DEMO_MODE is True


def test_existing_endpoints_return_success_in_fallback_mode(client, db_session):
    from models import Listing

    listing = Listing(
        name="Existing API Test House",
        address="2 Campus Way",
        lat=37.65,
        lng=-122.05,
        rent=1600,
        bedrooms=1,
        landlord_name="Test Landlord",
        safety_score=7,
        distance_miles=1,
    )
    db_session.add(listing)
    db_session.commit()

    health_response = client.get("/")
    listings_response = client.get("/listings")
    listing_response = client.get(f"/listings/{listing.id}")
    summary_response = client.get(f"/listings/{listing.id}/summary")
    lease_response = client.post("/lease/check", json={
        "text": "The tenant pays a non-refundable cleaning fee of $500. Utilities are not included in rent.",
    })

    assert health_response.status_code == 200
    assert health_response.json()["email_mode"] == "demo"
    assert listings_response.status_code == 200
    assert any(result["id"] == listing.id for result in listings_response.json())
    assert listing_response.status_code == 200
    assert listing_response.json()["id"] == listing.id
    assert summary_response.status_code == 200
    assert summary_response.json()["listing_id"] == listing.id
    assert lease_response.status_code == 200
    assert lease_response.json()["source"] == "basic"

    review_response = client.post(f"/listings/{listing.id}/reviews", json={
        "email": "student@csueastbay.edu",
        "overall_rating": 4,
        "landlord_rating": 4,
        "maintenance_rating": 4,
        "safety_rating": 4,
        "monthly_utilities": 120,
        "text": "The apartment was quiet and maintenance responded quickly.",
        "deposit_returned": True,
    })
    assert review_response.status_code == 201
    assert review_response.json()["email_mode"] == "demo"

    verify_response = client.post(
        f"/reviews/{review_response.json()['review_id']}/verify",
        json={"code": review_response.json()["demo_code"]},
    )
    assert verify_response.status_code == 200
    assert verify_response.json()["review"]["deposit_returned"] is True