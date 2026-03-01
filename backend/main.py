from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import AsyncSessionLocal, init_db
from routers import shops, auth
from seed_data import seed_db
from services.foursquare import (
    fetch_coffee_shops,
    set_last_foursquare_sync,
    should_fetch_from_foursquare,
    sync_foursquare_to_db,
)

import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)


# Load .env and .env.local (local overrides)
load_dotenv()
env_local = Path(__file__).resolve().parent / ".env.local"
if env_local.exists():
    load_dotenv(env_local)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()

    #Fetch from Foursquare; skip if synced within last 24 hours
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
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(shops.router)
app.include_router(auth.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
