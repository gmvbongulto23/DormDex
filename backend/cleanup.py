from datetime import datetime, timedelta

from database import SessionLocal
from models import Review


def delete_stale_unverified(db, max_age=timedelta(hours=24)) -> int:
    cutoff = datetime.utcnow() - max_age
    deleted = (
        db.query(Review)
        .filter(Review.verified.is_(False), Review.created_at < cutoff)
        .delete(synchronize_session="fetch")
    )
    db.commit()
    return deleted


def _main():
    db = SessionLocal()
    try:
        deleted = delete_stale_unverified(db)
        print(f"Deleted {deleted} stale unverified reviews.")
    finally:
        db.close()


if __name__ == "__main__":
    _main()