# Database migrations

Run migrations from `backend/` with `alembic upgrade head`. Alembic loads the
model metadata from `models.py` and enables batch rendering for SQLite.

`seed.py` drops and recreates tables directly through SQLAlchemy, so after
seeding an existing database, align Alembic's version marker with that schema:

```powershell
python seed.py
alembic stamp head
```

Use `alembic check` after stamping to confirm the database matches the models.