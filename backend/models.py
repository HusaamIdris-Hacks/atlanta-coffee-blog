from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, Text, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship, DeclarativeBase
from datetime import datetime, timezone
import secrets
import hashlib

class Base(DeclarativeBase):
    pass

class CoffeeShop(Base):
    __tablename__ = "coffee_shops"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    foursquare_id: Mapped[str | None] = mapped_column(String(64), nullable=True, unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str] = mapped_column(String(500), nullable=False)
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lng: Mapped[float] = mapped_column(Float, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    website: Mapped[str | None] = mapped_column(String(500), nullable=True)
    instagram: Mapped[str | None] = mapped_column(String(255), nullable=True)
    twitter: Mapped[str | None] = mapped_column(String(255), nullable=True)
    facebook: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    favorites: Mapped[list["Favorite"]] = relationship("Favorite", back_populates="shop")
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="shop")


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    profile_picture: Mapped[str | None] = mapped_column(String(500), nullable=True)
    profile_ring_color: Mapped[str | None] = mapped_column(String(20), nullable=True)  # hex e.g. #D97706
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    favorites: Mapped[list["Favorite"]] = relationship("Favorite", back_populates="user")
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="user")
    favorite_cities: Mapped[list["FavoriteCity"]] = relationship("FavoriteCity", back_populates="user")
    password_reset_tokens: Mapped[list["PasswordResetToken"]] = relationship(
        "PasswordResetToken", back_populates="user", cascade="all, delete-orphan"
    )


class FavoriteCity(Base):
    """User-saved US cities to jump to on the map."""

    __tablename__ = "favorite_cities"
    __table_args__ = (UniqueConstraint("user_id", "label", name="uq_user_city_label"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    label: Mapped[str] = mapped_column(String(255), nullable=False)
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lng: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    user: Mapped["User"] = relationship("User", back_populates="favorite_cities")


class Favorite(Base):
    __tablename__ = "favorites"
    __table_args__ = (UniqueConstraint("user_id", "shop_id", name="uq_user_shop"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    shop_id: Mapped[int] = mapped_column(Integer, ForeignKey("coffee_shops.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    user: Mapped["User"] = relationship("User", back_populates="favorites")
    shop: Mapped["CoffeeShop"] = relationship("CoffeeShop", back_populates="favorites")


class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = (
        UniqueConstraint("user_id", "shop_id", name="uq_user_shop_review"),
        CheckConstraint("rating >= 1 AND rating <= 5", name="ck_rating_range"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    shop_id: Mapped[int] = mapped_column(Integer, ForeignKey("coffee_shops.id", ondelete="CASCADE"), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-5
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user: Mapped["User"] = relationship("User", back_populates="reviews")
    shop: Mapped["CoffeeShop"] = relationship("CoffeeShop", back_populates="reviews")


RESET_TOKEN_BYTES = 32
RESET_TOKEN_TTL_HOURS = 1


class PasswordResetToken(Base):
    """Single-use, time-limited token for password reset.

    The raw token is only ever held in memory; only its SHA-256 hash is
    persisted so a DB leak can't be used to reset accounts.
    """

    __tablename__ = "password_reset_tokens"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    user: Mapped["User"] = relationship("User", back_populates="password_reset_tokens")

    @staticmethod
    def generate() -> tuple[str, str]:
        """Return (raw_token, token_hash). Store only the hash."""
        raw = secrets.token_urlsafe(RESET_TOKEN_BYTES)
        hashed = hashlib.sha256(raw.encode()).hexdigest()
        return raw, hashed

    @staticmethod
    def hash_token(raw: str) -> str:
        return hashlib.sha256(raw.encode()).hexdigest()