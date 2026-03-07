from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import APIRouter, Depends, HTTPException

from database import get_db
from models import Favorite
from schemas import FavoriteCreate, FavoriteResponse

router = APIRouter(prefix="/api/favorites", tags=["favorites"])

@router.get("", response_model=list[FavoriteResponse])
async def get_favorites(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Favorite).order_by(Favorite.id))
    favorites = result.scalars().all()
    return [FavoriteResponse.model_validate(f) for f in favorites]


@router.post("", response_model=FavoriteResponse)
async def create_favorite(favorite: FavoriteCreate, db: AsyncSession = Depends(get_db)):
    db_favorite = Favorite(user_id=favorite.user_id, shop_id=favorite.shop_id)
    db.add(db_favorite)
    await db.commit()
    await db.refresh(db_favorite)
    return FavoriteResponse.model_validate(db_favorite)


@router.delete("/{favorite_id}", response_model=FavoriteResponse)
async def delete_favorite(favorite_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Favorite).where(Favorite.id == favorite_id))
    favorite = result.scalar_one_or_none()
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite not found")
    await db.delete(favorite)
    await db.commit()
    return FavoriteResponse.model_validate(favorite)

async def get_favorite(favorite_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Favorite).where(Favorite.id == favorite_id))
    favorite = result.scalar_one_or_none()
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite not found")
    return FavoriteResponse.model_validate(favorite)

async def get_favorites_by_shop(shop_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Favorite).where(Favorite.shop_id == shop_id))
    favorites = result.scalars().all()
    return [FavoriteResponse.model_validate(f) for f in favorites]

async def get_favorites_by_user(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Favorite).where(Favorite.user_id == user_id))
    favorites = result.scalars().all()
    return [FavoriteResponse.model_validate(f) for f in favorites]
    