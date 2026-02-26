"""Coffee shops API routes."""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import APIRouter, Depends, HTTPException

from database import get_db
from models import CoffeeShop, Review
from schemas import CoffeeShopDetailResponse, CoffeeShopResponse

router = APIRouter(prefix="/api/shops", tags=["shops"])


@router.get("", response_model=list[CoffeeShopResponse])
async def get_shops(db: AsyncSession = Depends(get_db)):
    """Return all coffee shops."""
    result = await db.execute(select(CoffeeShop).order_by(CoffeeShop.name))
    shops = result.scalars().all()
    return [CoffeeShopResponse.model_validate(s) for s in shops]


@router.get("/{shop_id}", response_model=CoffeeShopDetailResponse)
async def get_shop(shop_id: int, db: AsyncSession = Depends(get_db)):
    """Return a single shop with reviews summary (avg rating, count)."""
    result = await db.execute(select(CoffeeShop).where(CoffeeShop.id == shop_id))
    shop = result.scalar_one_or_none()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")

    # Get avg rating and review count
    stats = await db.execute(
        select(func.avg(Review.rating), func.count(Review.id)).where(
            Review.shop_id == shop_id
        )
    )
    row = stats.one()
    avg_rating = float(row[0]) if row[0] is not None else None
    review_count = row[1] or 0

    return CoffeeShopDetailResponse(
        id=shop.id,
        name=shop.name,
        address=shop.address,
        lat=shop.lat,
        lng=shop.lng,
        description=shop.description,
        website=shop.website,
        created_at=shop.created_at,
        avg_rating=round(avg_rating, 1) if avg_rating is not None else None,
        review_count=review_count,
    )
