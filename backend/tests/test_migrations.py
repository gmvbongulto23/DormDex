from pathlib import Path

from alembic import command
from alembic.config import Config


BACKEND_DIR = Path(__file__).resolve().parents[1]


def test_migrations_match_models(tmp_path, monkeypatch):
    database_url = f"sqlite:///{(tmp_path / 'migration.db').as_posix()}"
    monkeypatch.setenv("DATABASE_URL", database_url)
    config = Config(str(BACKEND_DIR / "alembic.ini"))

    command.upgrade(config, "head")
    command.check(config)