"""Pydantic schemas for API request/response models."""

from datetime import datetime

from pydantic import BaseModel


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
