"""Coffee shops API routes."""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import APIRouter, Depends, HTTPException

from auth import get_current_user_optional
from database import get_db
from models import CoffeeShop, Favorite, Review, User
from schemas import CoffeeShopDetailResponse, CoffeeShopResponse, UserReviewInShop

router = APIRouter(prefix="/api/shops", tags=["shops"])


@router.get("", response_model=list[CoffeeShopResponse])
async def get_shops(db: AsyncSession = Depends(get_db)):
    """Return all coffee shops."""
    result = await db.execute(select(CoffeeShop).order_by(CoffeeShop.name))
    shops = result.scalars().all()
    return [CoffeeShopResponse.model_validate(s) for s in shops]


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
    user_review: UserReviewInShop | None = None

    if current_user:
        # Check if user has favorited this shop
        fav_result = await db.execute(
            select(Favorite).where(
                Favorite.user_id == current_user.id,
                Favorite.shop_id == shop_id,
            )
        )
        is_favorited = fav_result.scalar_one_or_none() is not None

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
        user_review=user_review,
    )
