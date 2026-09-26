"""Seed 20 FICTIONAL listings near CSUEB (Hayward, CA) with reviews.
Run: python seed.py            (resets the database)
     python seed.py --summaries (also pre-generates AI summaries so the demo is instant)
"""
import math
import random
import sys
from datetime import datetime, timedelta

from database import Base, engine, SessionLocal
from models import Listing, Review
from ai import summarize_reviews

random.seed(42)  # same data every run

CAMPUS = (37.6566, -122.0567)  # Cal State East Bay, Hayward

STREETS = ["Carlos Bee Blvd", "Mission Blvd", "Hayward Blvd", "B St", "Harder Rd", "Tennyson Rd",
           "Jackson St", "Foothill Blvd", "Grove Way", "Campus Dr", "D St", "Second St"]
NAMES = ["Hillside Commons", "Mission Terrace", "Bayview Flats", "Carlos Bee Cottage", "Pioneer Court",
         "Oak Ridge Apartments", "Downtown Lofts", "Garden Studio", "Harder Place", "Grove Villas",
         "Foothill House", "Summit Suites", "Eden Row", "Tennyson Gardens", "Palisade Place",
         "Jackson Square Apts", "Redwood Duplex", "Skyline Rooms", "Birch Street Studio", "Canyon View"]
LANDLORDS = ["Greenleaf Property Mgmt", "J. Ramirez (private owner)", "Bay Rentals Co.",
             "Hilltop Housing LLC", "M. Chen (private owner)", "Eastbay Living"]

GOOD = ["Landlord replies within a day and fixed our sink fast.",
        "Quiet building, great for studying. Walkable to the shuttle.",
        "Management is respectful and gives notice before entering.",
        "Well-lit parking and a locked front gate, I feel safe walking home at night.",
        "Deposit returned in full, no drama at move-out."]
MEH = ["Rent is fair but the walls are thin.",
       "Heating is weak in winter, so the PG&E bill spikes in Dec-Feb.",
       "Maintenance is slow, took a week to fix the fridge.",
       "Street parking only and it fills up after 6 PM."]
BAD = ["Mold in the bathroom that was never properly fixed.",
       "Landlord kept part of the deposit for normal wear and tear.",
       "Package theft happens a lot, and the entry door lock is broken.",
       "Hard to reach the landlord, took three weeks to get a response."]


def miles_between(a, b):
    dlat = (a[0] - b[0]) * 69.0
    dlng = (a[1] - b[1]) * 69.0 * math.cos(math.radians(a[0]))
    return round(math.hypot(dlat, dlng), 1)


def make_review(listing_id, quality, when):
    pool = GOOD if quality > 0.66 else MEH if quality > 0.33 else BAD
    other = MEH if pool is not MEH else random.choice([GOOD, BAD])
    base = 5 if quality > 0.66 else 3 if quality > 0.33 else 2
    jitter = lambda: max(1, min(5, base + random.choice([-1, 0, 0, 1])))
    return Review(
        listing_id=listing_id,
        email=f"student{random.randint(100, 999)}@horizon.csueastbay.edu",
        overall_rating=jitter(), landlord_rating=jitter(),
        maintenance_rating=jitter(), safety_rating=jitter(),
        monthly_utilities=random.randint(90, 260),
        text=f"{random.choice(pool)} {random.choice(other)}",
        created_at=when,
    )


def seed(with_summaries=False):
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    for i, name in enumerate(NAMES):
        lat = CAMPUS[0] + random.uniform(-0.025, 0.02)
        lng = CAMPUS[1] + random.uniform(-0.03, 0.02)
        bedrooms = random.choice([0, 1, 1, 2, 2, 3])
        rent = 1250 + bedrooms * 450 + random.randint(-150, 250)
        listing = Listing(
            name=name,
            address=f"{random.randint(100, 2999)} {random.choice(STREETS)}, Hayward, CA",
            lat=round(lat, 5), lng=round(lng, 5), rent=rent, bedrooms=bedrooms,
            landlord_name=random.choice(LANDLORDS),
            safety_score=round(random.uniform(4.5, 9.5), 1),
            distance_miles=miles_between((lat, lng), CAMPUS),
        )
        db.add(listing)
        db.flush()

        quality = random.random()
        for _ in range(random.randint(0 if i == len(NAMES) - 1 else 2, 6)):  # last one has 0 reviews
            when = datetime.utcnow() - timedelta(days=random.randint(5, 400))
            db.add(make_review(listing.id, quality, when))

    db.commit()

    if with_summaries:
        for l in db.query(Listing).all():
            l.ai_summary = summarize_reviews(l, l.reviews)
            print(f"  summary for {l.name}: {l.ai_summary}")
        db.commit()

    print(f"Seeded {db.query(Listing).count()} listings and {db.query(Review).count()} reviews.")
    db.close()


if __name__ == "__main__":
    seed(with_summaries="--summaries" in sys.argv)
