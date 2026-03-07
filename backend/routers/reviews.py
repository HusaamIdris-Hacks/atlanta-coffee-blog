from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import APIRouter, Depends, HTTPException

from database import get_db
from models import Review
from schemas import ReviewCreate, ReviewResponse, ReviewUpdate
from datetime import datetime, timezone


router = APIRouter(prefix="/api/reviews", tags=["reviews"])

@router.get("", response_model=list[ReviewResponse])
async def get_reviews(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Review).order_by(Review.id))
    reviews = result.scalars().all()
    return [ReviewResponse.model_validate(r) for r in reviews]


@router.post("", response_model=ReviewResponse)
async def create_review(review: ReviewCreate, db: AsyncSession = Depends(get_db)):
    db_review = Review(user_id=review.user_id, shop_id=review.shop_id, rating=review.rating, comment=review.comment)
    db.add(db_review)
    await db.commit()
    await db.refresh(db_review)
    return ReviewResponse.model_validate(db_review)


@router.put("/{review_id}", response_model=ReviewResponse)
async def update_review(review_id: int, review: ReviewUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Review).where(Review.id == review_id))
    db_review = result.scalar_one_or_none()
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
    for field, value in review.model_dump(exclude_unset=True).items():
        setattr(db_review, field, value)
    db_review.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(db_review)
    return ReviewResponse.model_validate(db_review)


@router.delete("/{review_id}", response_model=ReviewResponse)
async def delete_review(review_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Review).where(Review.id == review_id))
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    await db.delete(review)
    await db.commit()
    return ReviewResponse.model_validate(review)

async def get_review(review_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Review).where(Review.id == review_id))
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return ReviewResponse.model_validate(review)

async def get_reviews_by_shop(shop_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Review).where(Review.shop_id == shop_id))
    reviews = result.scalars().all()
    return [ReviewResponse.model_validate(r) for r in reviews]

async def get_reviews_by_user(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Review).where(Review.user_id == user_id))
    reviews = result.scalars().all()
    return [ReviewResponse.model_validate(r) for r in reviews]
