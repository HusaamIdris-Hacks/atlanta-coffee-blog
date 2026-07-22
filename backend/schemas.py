"""Pydantic schemas for API request/response models."""

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class CoffeeShopBase(BaseModel):
    """Base fields for coffee shop."""

    name: str
    address: str
    lat: float
    lng: float
    description: str | None
    website: str | None
    instagram: str | None = None
    twitter: str | None = None
    facebook: str | None = None


class CoffeeShopResponse(CoffeeShopBase):
    """Coffee shop as returned by the API."""

    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class UserReviewInShop(BaseModel):
    """Current user's review when viewing a shop (for edit/display)."""

    id: int
    rating: int
    comment: str | None
    updated_at: datetime


class CoffeeShopDetailResponse(CoffeeShopResponse):
    """Single shop with reviews summary."""

    avg_rating: float | None
    review_count: int
    is_favorited: bool | None = None  # None when not authenticated
    favorite_id: int | None = None  # Favorite row id for DELETE when favorited
    user_review: UserReviewInShop | None = None  # None when not authenticated or no review

# Auth request/response
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: str | None = None
    profile_picture: str | None = None
    profile_ring_color: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    name: str | None = None
    profile_ring_color: str | None = None
        
class UserShopBase(BaseModel):
    """Shared user + shop reference for favorites and reviews."""

    user_id: int
    shop_id: int


class UserShopResponseBase(UserShopBase):
    """Shared response fields for favorites and reviews."""

    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class FavoriteCreate(UserShopBase):
    pass


class FavoriteResponse(UserShopResponseBase):
    pass


class FavoriteCityCreate(BaseModel):
    label: str = Field(..., min_length=1, max_length=255)
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)


class FavoriteCityResponse(BaseModel):
    id: int
    label: str
    lat: float
    lng: float
    created_at: datetime

    class Config:
        from_attributes = True


class ShopAreaRefreshRequest(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)
    radius_m: int = Field(default=30_000, ge=5_000, le=50_000)


class ShopAreaRefreshResponse(BaseModel):
    merged_count: int
    fetched_count: int


class ReviewCreate(UserShopBase):
    rating: int = Field(ge=1, le=5, description="Rating from 1 to 5")
    comment: str | None = None


class ReviewUpdate(BaseModel):
    rating: int | None = Field(default=None, ge=1, le=5, description="Rating from 1 to 5")
    comment: str | None = None


class ReviewResponse(UserShopResponseBase):
    rating: int
    comment: str | None
    updated_at: datetime


class ReviewWithShopResponse(BaseModel):
    """Review with shop info for profile."""

    id: int
    shop_id: int
    shop_name: str
    shop_address: str
    shop_lat: float
    shop_lng: float
    rating: int
    comment: str | None
    created_at: datetime
    updated_at: datetime


class PasswordResetRequest(BaseModel):
    """Request a password-reset email."""

    email: EmailStr


class PasswordReset(BaseModel):
    """Complete a password reset using the emailed token."""

    token: str
    new_password: str = Field(min_length=6, description="New password (min 6 characters)")