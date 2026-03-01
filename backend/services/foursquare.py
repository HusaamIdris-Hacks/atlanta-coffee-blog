"""Foursquare Places API integration for fetching Atlanta coffee shops."""

import logging
import os
from typing import TYPE_CHECKING, Any

import httpx
from seed_data import seed_db

from models import CoffeeShop

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

FOURSQUARE_API_URL = "https://places-api.foursquare.com/places/search"
ATLANTA_LL = "33.7490,-84.3880"  # Atlanta city center
RADIUS_METERS = 30000  # ~31 miles to cover metro Atlanta
LIMIT = 50  # Max per request


def _parse_place(place: dict[str, Any]) -> CoffeeShop | None:
    """Map a Foursquare place result to a CoffeeShop model."""
    name = place.get("name")
    if not name:
        return None

    # New API: latitude/longitude at top level. Old API: geocodes.main
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
    """
    Fetch coffee shops in Atlanta from Foursquare Places API.
    Returns empty list on failure (caller should fall back to seed data).
    """
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
    """Replace all coffee shops in the DB with Foursquare results."""
    if not shops:
        logger.warning("No shops provided. Skipping sync to prevent truncating the table.")
        await seed_db(session)
        return

    from sqlalchemy import delete
    

    await session.execute(delete(CoffeeShop))
    session.add_all(shops)
    await session.commit()
    logger.info("Synced %d shops from Foursquare to database", len(shops))
