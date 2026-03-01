"""Pydantic schemas for API request/response models."""

from datetime import datetime

from pydantic import BaseModel, EmailStr


class CoffeeShopBase(BaseModel):
    """Base fields for coffee shop."""

    name: str
    address: str
    lat: float
    lng: float
    description: str | None
    website: str | None


class CoffeeShopResponse(CoffeeShopBase):
    """Coffee shop as returned by the API."""

    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class CoffeeShopDetailResponse(CoffeeShopResponse):
    """Single shop with reviews summary."""

    avg_rating: float | None
    review_count: int

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
    created_at: datetime

    class Config:
        from_attributes = True

