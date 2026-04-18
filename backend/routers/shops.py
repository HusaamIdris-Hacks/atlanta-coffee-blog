"""Coffee shops API routes."""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import APIRouter, Depends, HTTPException, Query

from auth import get_current_user_optional
from database import get_db
from models import CoffeeShop, Favorite, Review, User
from schemas import (
    CoffeeShopDetailResponse,
    CoffeeShopResponse,
    ShopAreaRefreshRequest,
    ShopAreaRefreshResponse,
    UserReviewInShop,
)
from services.foursquare import fetch_coffee_and_tea_near, merge_shops_into_db

router = APIRouter(prefix="/api/shops", tags=["shops"])


@router.get("", response_model=list[CoffeeShopResponse])
async def get_shops(
    db: AsyncSession = Depends(get_db),
    min_lat: float | None = None,
    max_lat: float | None = None,
    min_lng: float | None = None,
    max_lng: float | None = None,
    near_lat: float | None = None,
    near_lng: float | None = None,
    limit: int | None = Query(None, ge=1, le=200),
):
    """Return coffee/tea shops. BBox and/or nearest-N around a point (for map preload)."""
    q = select(CoffeeShop)

    if near_lat is not None and near_lng is not None and limit is not None:
        dlat = CoffeeShop.lat - near_lat
        dlng = CoffeeShop.lng - near_lng
        dist_sq = dlat * dlat + dlng * dlng
        q = q.order_by(dist_sq).limit(limit)
    else:
        if all(v is not None for v in (min_lat, max_lat, min_lng, max_lng)):
            q = q.where(
                CoffeeShop.lat >= min_lat,
                CoffeeShop.lat <= max_lat,
                CoffeeShop.lng >= min_lng,
                CoffeeShop.lng <= max_lng,
            )
        q = q.order_by(CoffeeShop.name)

    result = await db.execute(q)
    shops = result.scalars().all()
    return [CoffeeShopResponse.model_validate(s) for s in shops]


@router.post("/refresh-area", response_model=ShopAreaRefreshResponse)
async def refresh_area(
    body: ShopAreaRefreshRequest,
    db: AsyncSession = Depends(get_db),
):
    """Fetch coffee/tea from Foursquare near a point and merge into the database."""
    shops = await fetch_coffee_and_tea_near(body.lat, body.lng, body.radius_m)
    if not shops:
        return ShopAreaRefreshResponse(merged_count=0, fetched_count=0)
    merged, total = await merge_shops_into_db(db, shops)
    return ShopAreaRefreshResponse(merged_count=merged, fetched_count=total)


@router.get("/{shop_id}", response_model=CoffeeShopDetailResponse)
async def get_shop(
    shop_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    """Return a single shop with reviews summary. When authenticated, includes is_favorited and user_review."""
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

    is_favorited: bool | None = None
    favorite_id: int | None = None
    user_review: UserReviewInShop | None = None

    if current_user is not None:
        # Check if user has favorited this shop
        fav_result = await db.execute(
            select(Favorite).where(
                Favorite.user_id == current_user.id,
                Favorite.shop_id == shop_id,
            )
        )
        fav_row = fav_result.scalar_one_or_none()
        is_favorited = fav_row is not None
        favorite_id = fav_row.id if fav_row else None

        # Get user's review if any
        review_result = await db.execute(
            select(Review).where(
                Review.user_id == current_user.id,
                Review.shop_id == shop_id,
            )
        )
        review = review_result.scalar_one_or_none()
        if review:
            user_review = UserReviewInShop(
                id=review.id,
                rating=review.rating,
                comment=review.comment,
                updated_at=review.updated_at,
            )

    return CoffeeShopDetailResponse(
        id=shop.id,
        name=shop.name,
        address=shop.address,
        lat=shop.lat,
        lng=shop.lng,
        description=shop.description,
        website=shop.website,
        instagram=shop.instagram,
        twitter=shop.twitter,
        facebook=shop.facebook,
        created_at=shop.created_at,
        avg_rating=round(avg_rating, 1) if avg_rating is not None else None,
        review_count=review_count,
        is_favorited=is_favorited,
        favorite_id=favorite_id,
        user_review=user_review,
    )
