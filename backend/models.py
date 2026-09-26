from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
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
    safety_score = Column(Float, nullable=False)    # 1-10, seeded (future: city open data)
    distance_miles = Column(Float, nullable=False)  # to campus
    ai_summary = Column(Text, nullable=True)        # cached; cleared when a review is added

    reviews = relationship("Review", back_populates="listing",
                           cascade="all, delete-orphan", order_by="Review.created_at.desc()")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    email = Column(String, nullable=False)          # never returned by the API
    overall_rating = Column(Integer, nullable=False)      # 1-5
    landlord_rating = Column(Integer, nullable=False)     # 1-5
    maintenance_rating = Column(Integer, nullable=False)  # 1-5
    safety_rating = Column(Integer, nullable=False)       # 1-5
    monthly_utilities = Column(Integer, nullable=False)   # USD per month
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    listing = relationship("Listing", back_populates="reviews")
