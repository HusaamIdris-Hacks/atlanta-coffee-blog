from dotenv import load_dotenv
from pathlib import Path

load_dotenv()
env_local = Path(__file__).resolve().parent / ".env.local"
if env_local.exists():
    load_dotenv(env_local)

from fastapi import FastAPI  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from fastapi.staticfiles import StaticFiles  # noqa: E402

from database import AsyncSessionLocal, init_db  # noqa: E402
from routers import shops, auth, reviews, favorite, favorite_cities  # noqa: E402
from seed_data import seed_db  # noqa: E402
from services.foursquare import (  # noqa: E402
    fetch_coffee_shops,
    set_last_foursquare_sync,
    should_fetch_from_foursquare,
    sync_foursquare_to_db,
)

import logging  # noqa: E402
import os  # noqa: E402
from contextlib import asynccontextmanager  # noqa: E402
from datetime import datetime, timezone  # noqa: E402

logging.basicConfig(level=logging.INFO)

# CORS: localhost and 127.0.0.1 are different origins; include both for local dev.
_cors_extra = [
    o.strip()
    for o in os.getenv("CORS_ORIGINS", "").split(",")
    if o.strip()
]
_cors_allow_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    *_cors_extra,
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()

    if should_fetch_from_foursquare():
        shops = await fetch_coffee_shops()
        if shops:
            async with AsyncSessionLocal() as session:
                await sync_foursquare_to_db(session, shops)
            set_last_foursquare_sync(datetime.now(timezone.utc))
        else:
            async with AsyncSessionLocal() as session:
                await seed_db(session)
    else:
        logging.getLogger(__name__).info("Skipping Foursquare fetch (synced within last 24h)")
        async with AsyncSessionLocal() as session:
            await seed_db(session)  

    yield


app = FastAPI(
    title="Atlanta Coffee Shops API",
    description="API for the Atlanta coffee shop discovery app",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_allow_origins,
    # Any port on localhost / 127.0.0.1 (e.g. Next on 3001) without listing each
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(shops.router)
app.include_router(auth.router)
app.include_router(reviews.router)
app.include_router(favorite.router)
app.include_router(favorite_cities.router)

# Mount static files for avatars
static_dir = Path(__file__).resolve().parent / "static"
static_dir.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

@app.get("/api/health")
def health():
    return {"status": "ok"}
