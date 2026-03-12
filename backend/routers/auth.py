import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import CoffeeShop, Review, User
from schemas import (
    ChangePasswordRequest,
    ReviewWithShopResponse,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserProfileUpdate,
    UserResponse,
)
from auth import create_access_token, get_current_user_optional, verify_password, hash_password

router = APIRouter(prefix="/api/auth", tags=["auth"])

AVATARS_DIR = Path(__file__).resolve().parent.parent / "static" / "avatars"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Email already registered"
        )

    hashed_pwd = hash_password(user_data.password)
    new_user = User(
        email=user_data.email,
        password_hash=hashed_pwd,
        name=user_data.name,
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    token = create_access_token(new_user.id)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(user.id)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User | None = Depends(get_current_user_optional)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return current_user


@router.get("/users", response_model=list[UserResponse])
async def get_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).order_by(User.id))
    users = result.scalars().all()
    return [UserResponse.model_validate(u) for u in users]


@router.post("/logout", response_model=TokenResponse)
async def logout(current_user: User | None = Depends(get_current_user_optional)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return TokenResponse(access_token="")


@router.patch("/me", response_model=UserResponse)
async def update_profile(
    data: UserProfileUpdate,
    current_user: User | None = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    update_data = data.model_dump(exclude_unset=True)
    if "profile_ring_color" in update_data and update_data["profile_ring_color"] == "":
        update_data["profile_ring_color"] = None
    for field, value in update_data.items():
        setattr(current_user, field, value)
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.get("/me/reviews", response_model=list[ReviewWithShopResponse])
async def get_my_reviews(
    current_user: User | None = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    result = await db.execute(
        select(Review, CoffeeShop)
        .join(CoffeeShop, Review.shop_id == CoffeeShop.id)
        .where(Review.user_id == current_user.id)
        .order_by(Review.updated_at.desc())
    )
    rows = result.all()
    return [
        ReviewWithShopResponse(
            id=review.id,
            shop_id=review.shop_id,
            shop_name=shop.name,
            shop_address=shop.address,
            shop_lat=shop.lat,
            shop_lng=shop.lng,
            rating=review.rating,
            comment=review.comment,
            created_at=review.created_at,
            updated_at=review.updated_at,
        )
        for review, shop in rows
    ]


@router.post("/me/avatar", response_model=UserResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User | None = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Max 5MB.",
        )
    AVATARS_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"user_{current_user.id}_{uuid.uuid4().hex[:8]}{ext}"
    filepath = AVATARS_DIR / filename
    filepath.write_bytes(content)
    relative_path = f"avatars/{filename}"
    if current_user.profile_picture:
        old_path = Path(__file__).resolve().parent.parent / "static" / current_user.profile_picture
        if old_path.exists():
            try:
                old_path.unlink()
            except OSError:
                pass
    current_user.profile_picture = relative_path
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.post("/change-password", response_model=TokenResponse)
async def change_password(
    data: ChangePasswordRequest,
    current_user: User | None = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    if data.new_password == data.current_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password cannot be the same as the current password",
        )
    current_user.password_hash = hash_password(data.new_password)
    await db.commit()
    token = create_access_token(current_user.id)
    return TokenResponse(access_token=token)

