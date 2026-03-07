from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import os
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv

from database import get_db
from models import User

load_dotenv()
SECRET_KEY = os.getenv("JWT_SECRET")
if not SECRET_KEY:
    raise RuntimeError("JWT_SECRET environment variable must be set for authentication")
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(user_id: int) -> str:
    payload = {"sub": str(user_id), "exp":datetime.now(timezone.utc) + timedelta(days=7)}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    if not credentials or not SECRET_KEY:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(401, "Invalid token")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(401, "User not found")
    return user


async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User | None:
    """Return current user if authenticated, else None. Does not raise."""
    if not credentials or not SECRET_KEY:
        return None
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        return None
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()