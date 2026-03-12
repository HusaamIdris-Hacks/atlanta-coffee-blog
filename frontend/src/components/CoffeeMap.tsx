"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

import { getShops, getShopById, getFavorites } from "@/lib/api";
import type { CoffeeShop, CoffeeShopDetail } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import ShopPopupCard from "./ShopPopupCard";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

const ATLANTA_CENTER = {
  latitude: 33.749,
  longitude: -84.388,
};

export default function CoffeeMap() {
  const searchParams = useSearchParams();
  const { token, user } = useAuth();
  const mapRef = useRef<MapRef>(null);
  const [shops, setShops] = useState<CoffeeShop[]>([]);
  const [favoritedShopIds, setFavoritedShopIds] = useState<Set<number>>(new Set());
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState(false);
  const [selectedShop, setSelectedShop] = useState<CoffeeShopDetail | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getShops()
      .then(setShops)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!token || !user) {
      setFavoritedShopIds(new Set());
      return;
    }
    getFavorites(token)
      .then((favs) => {
        const ids = new Set(
          favs.filter((f) => f.user_id === user.id).map((f) => f.shop_id)
        );
        setFavoritedShopIds(ids);
      })
      .catch(() => setFavoritedShopIds(new Set()));
  }, [token, user]);

  const shopsToShow = useMemo(() => {
    if (!filterFavoritesOnly) return shops;
    return shops.filter((s) => favoritedShopIds.has(s.id));
  }, [shops, filterFavoritesOnly, favoritedShopIds]);

  // Open shop from URL ?shop=id
  useEffect(() => {
    const shopId = searchParams.get("shop");
    if (!shopId || loading) return;
    const id = parseInt(shopId, 10);
    if (isNaN(id)) return;
    const shop = shops.find((s) => s.id === id);
    if (!shop) return;
    getShopById(id, token)
      .then((detail) => {
        setSelectedShop(detail);
        mapRef.current?.flyTo({
          center: [shop.lng, shop.lat],
          zoom: 14,
          duration: 800,
        });
      })
      .catch(() => {});
  }, [searchParams, loading, shops, token]);

  const handleMarkerClick = useCallback(
    async (shop: CoffeeShop) => {
      try {
        const detail = await getShopById(shop.id, token);
        setSelectedShop(detail);

        mapRef.current?.flyTo({
          center: [shop.lng, shop.lat],
          zoom: 14,
          duration: 800,
        });
      } catch (err) {
        console.error("Failed to load shop details:", err);
      }
    },
    [token]
  );

  const handleClosePopup = useCallback(() => {
    setSelectedShop(null);
  }, []);

  const refreshFavorites = useCallback(async () => {
    if (!token || !user) return;
    try {
      const favs = await getFavorites(token);
      const ids = new Set(
        favs.filter((f) => f.user_id === user.id).map((f) => f.shop_id)
      );
      setFavoritedShopIds(ids);
    } catch {
      setFavoritedShopIds(new Set());
    }
  }, [token, user]);

  const refreshShop = useCallback(
    async (shopId: number) => {
      try {
        const updated = await getShopById(shopId, token);
        setSelectedShop(updated);
        await refreshFavorites();
      } catch (err) {
        console.error("Failed to refresh shop:", err);
      }
    },
    [token, refreshFavorites]
  );

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-amber-50">
        <div className="text-center p-8">
          <p className="text-2xl mb-2">☕</p>
          <p className="text-amber-900 font-semibold mb-1">
            Couldn&apos;t load coffee shops
          </p>
          <p className="text-gray-500 text-sm">{error}</p>
          <p className="text-gray-400 text-xs mt-2">
            Make sure the backend is running on port 8000
          </p>
        </div>
      </div>
    );
  }

  const isLoggedIn = !!user && !!token;

  return (
    <div className="relative w-full h-full">
      <Map
        ref={mapRef}
        initialViewState={{
          ...ATLANTA_CENTER,
          zoom: 11.5,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <NavigationControl position="top-right" />

        {shopsToShow.map((shop) => {
          const isFavorited = favoritedShopIds.has(shop.id);
          return (
            <Marker
              key={shop.id}
              latitude={shop.lat}
              longitude={shop.lng}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                handleMarkerClick(shop);
              }}
            >
              <button
                className="flex flex-col items-center group cursor-pointer"
                aria-label={`View ${shop.name}${isFavorited ? " (favorited)" : ""}`}
              >
                <span className="text-2xl group-hover:scale-125 transition-transform drop-shadow-md">
                  {isFavorited ? (
                    <span title="Favorited">❤️</span>
                  ) : (
                    <span title="Coffee shop">☕</span>
                  )}
                </span>
              </button>
            </Marker>
          );
        })}
      </Map>

      {/* Favorites filter button */}
      {isLoggedIn && (
        <div className="absolute top-4 right-14 z-10">
          <button
            onClick={() => setFilterFavoritesOnly((prev) => !prev)}
            className={`px-4 py-2 rounded-lg font-medium text-sm shadow-md transition-colors flex items-center gap-2 ${
              filterFavoritesOnly
                ? "bg-amber-800 text-white"
                : "bg-white text-amber-900 border border-amber-200 hover:bg-amber-50"
            }`}
            title={filterFavoritesOnly ? "Show all shops" : "Show only favorites"}
          >
            <span>❤️</span>
            {filterFavoritesOnly ? "Favorites only" : "All shops"}
          </button>
        </div>
      )}

      {/* Empty state when filtering favorites with none */}
      {isLoggedIn && filterFavoritesOnly && shopsToShow.length === 0 && !loading && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-lg bg-white/95 border border-amber-200 shadow-md text-sm text-amber-900">
          No favorites yet — click a shop and add it to your favorites
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-10">
          <div className="text-center">
            <p className="text-3xl animate-bounce">☕</p>
            <p className="text-amber-900 font-semibold mt-2">
              Loading shops...
            </p>
          </div>
        </div>
      )}

      {/* Popup card */}
      {selectedShop && (
        <div className="absolute top-4 left-4 z-20">
          <ShopPopupCard
            shop={selectedShop}
            onClose={handleClosePopup}
            onRefresh={() => refreshShop(selectedShop.id)}
          />
        </div>
      )}
    </div>
  );
}
