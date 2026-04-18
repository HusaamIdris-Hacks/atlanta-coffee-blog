import os

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from models import Base

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite+aiosqlite:///./data/atlanta_coffee.db",
)

engine = create_async_engine(
    DATABASE_URL,
    echo=os.getenv("SQL_ECHO", "false").lower() == "true",
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def init_db() -> None:
    """Create all tables. Call on application startup."""
    # Ensure data directory exists for SQLite
    if DATABASE_URL.startswith("sqlite"):
        db_path = DATABASE_URL.replace("sqlite+aiosqlite:///", "")
        if "/" in db_path or "\\" in db_path:
            os.makedirs(os.path.dirname(db_path), exist_ok=True)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Add social columns if missing (migration for existing DBs)
        for col in ("instagram", "twitter", "facebook"):
            try:
                await conn.execute(text(f"ALTER TABLE coffee_shops ADD COLUMN {col} VARCHAR(255)"))
            except Exception:
                pass  # Column already exists

        # Add users.name if missing (migration for existing DBs)
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN name VARCHAR(255)"))
        except Exception:
            pass  # Column already exists

        # Add profile columns to users
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN profile_picture VARCHAR(500)"))
        except Exception:
            pass
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN profile_ring_color VARCHAR(20)"))
        except Exception:
            pass

        try:
            await conn.execute(text("ALTER TABLE coffee_shops ADD COLUMN foursquare_id VARCHAR(64)"))
        except Exception:
            pass
        try:
            await conn.execute(
                text("CREATE UNIQUE INDEX IF NOT EXISTS ix_coffee_shops_foursquare_id ON coffee_shops (foursquare_id)")
            )
        except Exception:
            pass


async def get_db():
    """FastAPI dependency that yields an async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
