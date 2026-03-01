"""Foursquare Places API integration for fetching Atlanta coffee shops."""

import logging
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import TYPE_CHECKING, Any

import httpx

from models import CoffeeShop
from seed_data import seed_db

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

SYNC_INTERVAL_HOURS = 24
SYNC_TIMESTAMP_FILE = Path(__file__).resolve().parent.parent / "data" / "last_foursquare_sync"

FOURSQUARE_API_URL = "https://places-api.foursquare.com/places/search"
ATLANTA_LL = "33.7490,-84.3880"
RADIUS_METERS = 30000
LIMIT = 50


def get_last_foursquare_sync() -> datetime | None:
    """Return when we last synced from Foursquare, or None if never."""
    if not SYNC_TIMESTAMP_FILE.exists():
        return None
    try:
        text = SYNC_TIMESTAMP_FILE.read_text().strip()
        return datetime.fromisoformat(text)
    except (ValueError, OSError):
        return None


def set_last_foursquare_sync(dt: datetime) -> None:
    """Record that we synced from Foursquare at the given time."""
    SYNC_TIMESTAMP_FILE.parent.mkdir(parents=True, exist_ok=True)
    SYNC_TIMESTAMP_FILE.write_text(dt.isoformat())


def should_fetch_from_foursquare() -> bool:
    """Return True if we should fetch (stale or never synced)."""
    last = get_last_foursquare_sync()
    if last is None:
        return True
    now = datetime.now(timezone.utc)
    if last.tzinfo is None:
        last = last.replace(tzinfo=timezone.utc)
    elapsed = now - last
    return elapsed.total_seconds() >= SYNC_INTERVAL_HOURS * 3600


def _parse_place(place: dict[str, Any]) -> CoffeeShop | None:
    """Map a Foursquare place result to a CoffeeShop model."""
    name = place.get("name")
    if not name:
        return None

    lat = place.get("latitude")
    lng = place.get("longitude")
    if lat is None or lng is None:
        geocodes = place.get("geocodes", {}) or {}
        main = geocodes.get("main") or geocodes.get("drop_off") or geocodes.get("front_door")
        if main:
            lat = main.get("latitude")
            lng = main.get("longitude")
    if lat is None or lng is None:
        return None

    location = place.get("location") or {}
    address = (
        location.get("formatted_address")
        or location.get("address")
        or f"{location.get('locality', 'Atlanta')}, {location.get('region', 'GA')}"
    )
    if not address:
        address = "Atlanta, GA"

    description = place.get("description")
    website = place.get("website") or place.get("link")
    if website and not website.startswith("http"):
        website = f"https://foursquare.com{website}" if website.startswith("/") else None

    return CoffeeShop(
        name=name,
        address=address,
        lat=float(lat),
        lng=float(lng),
        description=description[:500] if description else None,
        website=website[:500] if website else None,
    )


async def fetch_coffee_shops() -> list[CoffeeShop]:
    api_key_secret = os.getenv("FOURSQUARE_API_SECRET")
    
    if not api_key_secret:
        logger.warning("FOURSQUARE_API_SECRET not set, skipping Foursquare fetch")
        return []

    headers = {
        "X-Places-Api-Version": "2025-06-17",
        "accept": "application/json",
        "authorization": f"Bearer {api_key_secret}"
    }

    params = {
        "query": "coffee shop",
        "ll": ATLANTA_LL,
        "radius": RADIUS_METERS,
        "limit": LIMIT,
        "categories": "4bf58dd8d48988d1e0931735",
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(FOURSQUARE_API_URL, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPError as e:
        logger.error("Foursquare API request failed: %s", e)
        return []
    except Exception as e:
        logger.exception("Unexpected error fetching Foursquare: %s", e)
        return []

    results = data.get("results") or []
    shops: list[CoffeeShop] = []
    for place in results:
        shop = _parse_place(place)
        if shop:
            shops.append(shop)

    logger.info("Fetched %d coffee shops from Foursquare", len(shops))
    return shops


async def sync_foursquare_to_db(session: "AsyncSession", shops: list[CoffeeShop]) -> None:
    if not shops:
        logger.warning("No shops provided. Skipping sync to prevent truncating the table.")
        await seed_db(session)
        return

    from sqlalchemy import delete
    
    await session.execute(delete(CoffeeShop))
    session.add_all(shops)
    await session.commit()
    logger.info("Synced %d shops from Foursquare to database", len(shops))
