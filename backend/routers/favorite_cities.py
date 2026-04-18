"""User-saved cities for map navigation."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import APIRouter, Depends, HTTPException, status

from auth import get_current_user
from database import get_db
from models import FavoriteCity, User
from schemas import FavoriteCityCreate, FavoriteCityResponse

router = APIRouter(prefix="/api/favorite-cities", tags=["favorite-cities"])


@router.get("", response_model=list[FavoriteCityResponse])
async def list_favorite_cities(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(FavoriteCity)
        .where(FavoriteCity.user_id == current_user.id)
        .order_by(FavoriteCity.label)
    )
    rows = result.scalars().all()
    return [FavoriteCityResponse.model_validate(r) for r in rows]


@router.post("", response_model=FavoriteCityResponse, status_code=status.HTTP_201_CREATED)
async def add_favorite_city(
    body: FavoriteCityCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dup = await db.execute(
        select(FavoriteCity).where(
            FavoriteCity.user_id == current_user.id,
            FavoriteCity.label == body.label.strip(),
        )
    )
    if dup.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="City already saved")

    row = FavoriteCity(
        user_id=current_user.id,
        label=body.label.strip(),
        lat=body.lat,
        lng=body.lng,
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return FavoriteCityResponse.model_validate(row)


@router.delete("/{city_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_favorite_city(
    city_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(FavoriteCity).where(
            FavoriteCity.id == city_id,
            FavoriteCity.user_id == current_user.id,
        )
    )
    row = result.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Saved city not found")
    await db.delete(row)
    await db.commit()
    return None
