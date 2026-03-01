import logging
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import AsyncSessionLocal, init_db
from routers import shops
from seed_data import seed_db
from services.foursquare import fetch_coffee_shops, sync_foursquare_to_db

# Load .env and .env.local (local overrides)
load_dotenv()
env_local = Path(__file__).resolve().parent / ".env.local"
if env_local.exists():
    load_dotenv(env_local)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()

    # Phase 1b: Fetch from Foursquare once per session; fallback to seed data
    shops = await fetch_coffee_shops()
    if shops:
        async with AsyncSessionLocal() as session:
            await sync_foursquare_to_db(session, shops)
    else:
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


@app.get("/api/health")
def health():
    return {"status": "ok"}
