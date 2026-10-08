"""Add deposit return feedback and verified review index.

Revision ID: 0002_review_deposit_returned_verified_index
Revises: 0001_baseline
"""
from alembic import op
import sqlalchemy as sa


revision = "0002_review_deposit_returned_verified_index"
down_revision = "0001_baseline"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("reviews") as batch_op:
        batch_op.add_column(sa.Column("deposit_returned", sa.Boolean(), nullable=True))
        batch_op.create_index("ix_reviews_verified", ["verified"], unique=False)


def downgrade():
    with op.batch_alter_table("reviews") as batch_op:
        batch_op.drop_index("ix_reviews_verified")
        batch_op.drop_column("deposit_returned")