"""Foursquare Places API: coffee & tea near a point, merged into DB by place id."""

import logging
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import TYPE_CHECKING, Any

import httpx
from sqlalchemy import select

from models import CoffeeShop
from seed_data import seed_db

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

SYNC_INTERVAL_HOURS = 24
SYNC_TIMESTAMP_FILE = Path(__file__).resolve().parent.parent / "data" / "last_foursquare_sync"

FOURSQUARE_API_URL = "https://places-api.foursquare.com/places/search"
DEFAULT_LAT = 33.7490
DEFAULT_LNG = -84.3880
RADIUS_METERS = 30_000
LIMIT = 50

# Coffee Shop, Tea Room
FOURSQUARE_CATEGORIES = (
    "4bf58dd8d48988d1dc931735",
    "4bf58dd8d48988d10d951735",
)


def get_last_foursquare_sync() -> datetime | None:
    if not SYNC_TIMESTAMP_FILE.exists():
        return None
    try:
        text = SYNC_TIMESTAMP_FILE.read_text().strip()
        return datetime.fromisoformat(text)
    except (ValueError, OSError):
        return None


def set_last_foursquare_sync(dt: datetime) -> None:
    SYNC_TIMESTAMP_FILE.parent.mkdir(parents=True, exist_ok=True)
    SYNC_TIMESTAMP_FILE.write_text(dt.isoformat())


def should_fetch_from_foursquare() -> bool:
    last = get_last_foursquare_sync()
    if last is None:
        return True
    now = datetime.now(timezone.utc)
    if last.tzinfo is None:
        last = last.replace(tzinfo=timezone.utc)
    elapsed = now - last
    return elapsed.total_seconds() >= SYNC_INTERVAL_HOURS * 3600


def _place_key(place: dict[str, Any]) -> str:
    fsq = place.get("fsq_id") or place.get("fsq_place_id")
    if fsq:
        return str(fsq)
    lat = place.get("latitude")
    lng = place.get("longitude")
    if lat is None or lng is None:
        geocodes = place.get("geocodes", {}) or {}
        main = geocodes.get("main") or geocodes.get("drop_off") or geocodes.get("front_door")
        if main:
            lat = main.get("latitude")
            lng = main.get("longitude")
    name = place.get("name") or ""
    return f"{round(float(lat or 0), 5)}_{round(float(lng or 0), 5)}_{name}"


def _parse_place(place: dict[str, Any]) -> CoffeeShop | None:
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

    fsq_raw = place.get("fsq_id") or place.get("fsq_place_id")
    foursquare_id = str(fsq_raw)[:64] if fsq_raw else None

    location = place.get("location") or {}
    address = (
        location.get("formatted_address")
        or location.get("address")
        or f"{location.get('locality', '')}, {location.get('region', '')}".strip(", ")
        or "United States"
    )
    if not address:
        address = "United States"

    description = place.get("description")
    website = place.get("website") or place.get("link")
    if website and not website.startswith("http"):
        website = f"https://foursquare.com{website}" if website.startswith("/") else None

    social = place.get("social_media") or {}
    instagram = social.get("instagram")
    if instagram and not instagram.startswith("http"):
        instagram = f"https://instagram.com/{instagram.lstrip('@')}" if instagram else None
    instagram = instagram[:255] if instagram else None

    twitter = social.get("twitter")
    if twitter and not twitter.startswith("http"):
        twitter = f"https://twitter.com/{twitter.lstrip('@')}" if twitter else None
    twitter = twitter[:255] if twitter else None

    facebook_id = social.get("facebook_id")
    facebook = f"https://facebook.com/{facebook_id}" if facebook_id else None
    facebook = facebook[:255] if facebook else None

    return CoffeeShop(
        foursquare_id=foursquare_id,
        name=name,
        address=address,
        lat=float(lat),
        lng=float(lng),
        description=description[:500] if description else None,
        website=website[:500] if website else None,
        instagram=instagram,
        twitter=twitter,
        facebook=facebook,
    )


async def fetch_coffee_and_tea_near(
    lat: float,
    lng: float,
    radius_m: int = RADIUS_METERS,
) -> list[CoffeeShop]:
    api_key_secret = os.getenv("FOURSQUARE_API_SECRET")
    if not api_key_secret:
        logger.warning("FOURSQUARE_API_SECRET not set, skipping Foursquare fetch")
        return []

    ll = f"{lat},{lng}"
    headers = {
        "X-Places-Api-Version": "2025-06-17",
        "accept": "application/json",
        "authorization": f"Bearer {api_key_secret}",
    }

    merged: dict[str, dict[str, Any]] = {}
    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            for cat in FOURSQUARE_CATEGORIES:
                params = {
                    "query": "coffee tea",
                    "ll": ll,
                    "radius": min(radius_m, 50_000),
                    "limit": LIMIT,
                    "categories": cat,
                }
                response = await client.get(FOURSQUARE_API_URL, headers=headers, params=params)
                response.raise_for_status()
                data = response.json()
                for place in data.get("results") or []:
                    merged[_place_key(place)] = place
    except httpx.HTTPError as e:
        logger.error("Foursquare API request failed: %s", e)
        return []
    except Exception as e:
        logger.exception("Unexpected error fetching Foursquare: %s", e)
        return []

    shops: list[CoffeeShop] = []
    for place in merged.values():
        shop = _parse_place(place)
        if shop:
            shops.append(shop)

    logger.info("Fetched %d coffee/tea places near %s", len(shops), ll)
    return shops


async def fetch_coffee_shops() -> list[CoffeeShop]:
    """Default Atlanta area (startup sync)."""
    return await fetch_coffee_and_tea_near(DEFAULT_LAT, DEFAULT_LNG, RADIUS_METERS)


async def merge_shops_into_db(session: "AsyncSession", shops: list[CoffeeShop]) -> tuple[int, int]:
    """
    Upsert shops by foursquare_id, else by name + nearby coordinates.
    Returns (inserted_or_updated_count, total_processed).
    """
    if not shops:
        return 0, 0

    touched = 0
    for shop in shops:
        existing = None
        if shop.foursquare_id:
            r = await session.execute(
                select(CoffeeShop).where(CoffeeShop.foursquare_id == shop.foursquare_id)
            )
            existing = r.scalar_one_or_none()

        if existing is None:
            r = await session.execute(
                select(CoffeeShop).where(
                    CoffeeShop.name == shop.name,
                    CoffeeShop.lat.between(shop.lat - 0.00025, shop.lat + 0.00025),
                    CoffeeShop.lng.between(shop.lng - 0.00025, shop.lng + 0.00025),
                )
            )
            existing = r.scalar_one_or_none()

        if existing:
            existing.name = shop.name
            existing.address = shop.address
            existing.lat = shop.lat
            existing.lng = shop.lng
            existing.description = shop.description
            existing.website = shop.website
            existing.instagram = shop.instagram
            existing.twitter = shop.twitter
            existing.facebook = shop.facebook
            if existing.foursquare_id is None and shop.foursquare_id:
                existing.foursquare_id = shop.foursquare_id
        else:
            session.add(shop)
        touched += 1

    logger.info("Prepared merge for %d shops (commit by caller)", touched)
    return touched, len(shops)


async def sync_foursquare_to_db(session: "AsyncSession", shops: list[CoffeeShop]) -> None:
    """Startup path: merge when we have API data; otherwise seed."""
    if not shops:
        logger.warning("No shops from Foursquare; seeding fallback.")
        await seed_db(session)
        return
    await merge_shops_into_db(session, shops)
    await session.commit()
