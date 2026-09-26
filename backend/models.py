from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    rent = Column(Integer, nullable=False)          # monthly rent in USD
    bedrooms = Column(Integer, nullable=False)
    landlord_name = Column(String, nullable=False)
    safety_score = Column(Float, nullable=False)    # 1-10, DEMO score from seed (future: city open data)
    distance_miles = Column(Float, nullable=False)  # to campus
    ai_summary = Column(Text, nullable=True)        # cached; cleared when a verified review is added

    reviews = relationship("Review", back_populates="listing",
                           cascade="all, delete-orphan", order_by="Review.created_at.desc()")

    @property
    def verified_reviews(self):
        """Only reviews whose email code was confirmed count toward costs, ratings and the AI summary."""
        return [r for r in self.reviews if r.verified]


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False, index=True)
    email = Column(String, nullable=False, index=True)    # never returned by the API
    overall_rating = Column(Integer, nullable=False)      # 1-5
    landlord_rating = Column(Integer, nullable=False)     # 1-5
    maintenance_rating = Column(Integer, nullable=False)  # 1-5
    safety_rating = Column(Integer, nullable=False)       # 1-5
    monthly_utilities = Column(Integer, nullable=False)   # USD per month
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Email verification: a review only counts after the student enters the code we emailed.
    verified = Column(Boolean, nullable=False, default=False)
    code_hash = Column(String, nullable=True)
    code_expires_at = Column(DateTime, nullable=True)
    verify_attempts = Column(Integer, nullable=False, default=0)

    listing = relationship("Listing", back_populates="reviews")