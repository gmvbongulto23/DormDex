"""Baseline matching the original SQLAlchemy models.

Revision ID: 0001_baseline
Revises:
"""
from alembic import op
import sqlalchemy as sa


revision = "0001_baseline"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "listings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("address", sa.String(), nullable=False),
        sa.Column("lat", sa.Float(), nullable=False),
        sa.Column("lng", sa.Float(), nullable=False),
        sa.Column("rent", sa.Integer(), nullable=False),
        sa.Column("bedrooms", sa.Integer(), nullable=False),
        sa.Column("landlord_name", sa.String(), nullable=False),
        sa.Column("safety_score", sa.Float(), nullable=False),
        sa.Column("distance_miles", sa.Float(), nullable=False),
        sa.Column("ai_summary", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "reviews",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("listing_id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("overall_rating", sa.Integer(), nullable=False),
        sa.Column("landlord_rating", sa.Integer(), nullable=False),
        sa.Column("maintenance_rating", sa.Integer(), nullable=False),
        sa.Column("safety_rating", sa.Integer(), nullable=False),
        sa.Column("monthly_utilities", sa.Integer(), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("verified", sa.Boolean(), nullable=False),
        sa.Column("code_hash", sa.String(), nullable=True),
        sa.Column("code_expires_at", sa.DateTime(), nullable=True),
        sa.Column("verify_attempts", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["listing_id"], ["listings.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_reviews_email", "reviews", ["email"], unique=False)
    op.create_index("ix_reviews_listing_id", "reviews", ["listing_id"], unique=False)


def downgrade():
    op.drop_index("ix_reviews_listing_id", table_name="reviews")
    op.drop_index("ix_reviews_email", table_name="reviews")
    op.drop_table("reviews")
    op.drop_table("listings")