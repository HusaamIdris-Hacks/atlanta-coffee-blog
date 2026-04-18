"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import type { Map as MapboxMap } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import {
  deleteFavoriteCity,
  getFavoriteCities,
  getShopById,
  getShopsInBounds,
  getShopsNearest,
  MAP_PRELOAD_SHOP_COUNT,
  refreshShopArea,
  type CoffeeShop,
  type CoffeeShopDetail,
  type FavoriteCity,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useMapPageBridge } from "@/contexts/MapPageBridgeContext";
import { useToast } from "@/contexts/ToastContext";
import ShopPopupCard from "./ShopPopupCard";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

const ATLANTA_CENTER = {
  latitude: 33.749,
  longitude: -84.388,
};

/** Blue saved-city markers only at this zoom or lower (more zoomed out). */
const ZOOM_SHOW_FAVORITE_CITY_MARKERS = 10.75;

function boundsPayload(map: MapboxMap) {
  const b = map.getBounds();
  if (!b) {
    return {
      min_lat: ATLANTA_CENTER.latitude - 0.35,
      max_lat: ATLANTA_CENTER.latitude + 0.35,
      min_lng: ATLANTA_CENTER.longitude - 0.45,
      max_lng: ATLANTA_CENTER.longitude + 0.45,
    };
  }
  return {
    min_lat: b.getSouth(),
    max_lat: b.getNorth(),
    min_lng: b.getWest(),
    max_lng: b.getEast(),
  };
}

function mergeShopsById(a: CoffeeShop[], b: CoffeeShop[]): CoffeeShop[] {
  const m = new globalThis.Map<number, CoffeeShop>();
  for (const s of a) m.set(s.id, s);
  for (const s of b) m.set(s.id, s);
  return Array.from(m.values());
}

export default function CoffeeMap() {
  const searchParams = useSearchParams();
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const mapPageBridge = useMapPageBridge();
  const mapRef = useRef<MapRef>(null);
  const lastOpenedFromUrl = useRef<string | null>(null);
  const moveDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [shops, setShops] = useState<CoffeeShop[]>([]);
  const [selectedShop, setSelectedShop] = useState<CoffeeShopDetail | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [areaBusy, setAreaBusy] = useState(false);

  const [favoriteCities, setFavoriteCities] = useState<FavoriteCity[]>([]);
  const [citiesMenuOpen, setCitiesMenuOpen] = useState(false);
  const [mapZoom, setMapZoom] = useState(11.5);

  const showFavoriteCityMarkers =
    mapZoom <= ZOOM_SHOW_FAVORITE_CITY_MARKERS && favoriteCities.length > 0;

  const loadShopsForMap = useCallback(
    async (map: MapboxMap, replace: boolean) => {
      try {
        const list = await getShopsInBounds(boundsPayload(map));
        setShops((prev) => (replace ? list : mergeShopsById(prev, list)));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load shops");
      }
    },
    []
  );

  const scheduleReloadBounds = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    if (moveDebounce.current) clearTimeout(moveDebounce.current);
    moveDebounce.current = setTimeout(() => {
      void loadShopsForMap(map, true);
    }, 550);
  }, [loadShopsForMap]);

  useEffect(() => {
    let cancelled = false;
    void getShopsNearest(
      ATLANTA_CENTER.latitude,
      ATLANTA_CENTER.longitude,
      MAP_PRELOAD_SHOP_COUNT
    )
      .then((list) => {
        if (!cancelled && list.length > 0) {
          setShops(list);
          setError(null);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const focusCity = useCallback(
    async (lat: number, lng: number, label?: string) => {
      const map = mapRef.current?.getMap();
      if (!map) return;
      setAreaBusy(true);
      setSelectedShop(null);
      try {
        await refreshShopArea(lat, lng, 30_000);
        map.flyTo({
          center: [lng, lat],
          zoom: 11.2,
          duration: 900,
        });
        setTimeout(() => {
          const m = mapRef.current?.getMap();
          if (m) void loadShopsForMap(m, true);
          setAreaBusy(false);
        }, 950);
        if (label) {
          showToast(`Showing coffee & tea near ${label.split(",")[0]}`, "success");
        }
      } catch (err) {
        setAreaBusy(false);
        showToast(
          err instanceof Error ? err.message : "Could not load this area",
          "error"
        );
      }
    },
    [loadShopsForMap, showToast]
  );

  const reloadSavedCities = useCallback(async () => {
    if (!token || !user) {
      setFavoriteCities([]);
      return;
    }
    try {
      const list = await getFavoriteCities(token);
      setFavoriteCities(list);
    } catch {
      setFavoriteCities([]);
    }
  }, [token, user]);

  useEffect(() => {
    void reloadSavedCities();
  }, [reloadSavedCities]);

  useEffect(() => {
    if (!mapPageBridge?.setBridge) return;
    mapPageBridge.setBridge({
      focusCity,
      reloadSavedCities,
    });
  }, [mapPageBridge?.setBridge, focusCity, reloadSavedCities]);

  useEffect(() => {
    const setB = mapPageBridge?.setBridge;
    return () => {
      setB?.(null);
    };
  }, [mapPageBridge?.setBridge]);

  useEffect(() => {
    const shopParam = searchParams.get("shop");
    if (!shopParam) {
      lastOpenedFromUrl.current = null;
      return;
    }
    if (loading) return;
    if (lastOpenedFromUrl.current === shopParam) return;
    const id = parseInt(shopParam, 10);
    if (Number.isNaN(id)) return;
    lastOpenedFromUrl.current = shopParam;
    let cancelled = false;
    (async () => {
      try {
        const detail = await getShopById(id, token);
        if (cancelled) return;
        setSelectedShop(detail);
        mapRef.current?.flyTo({
          center: [detail.lng, detail.lat],
          zoom: 14,
          duration: 800,
        });
        const map = mapRef.current?.getMap();
        if (map) void loadShopsForMap(map, true);
      } catch {
        if (!cancelled) {
          showToast("Couldn’t open shop from link", "error");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams, loading, token, showToast, loadShopsForMap]);

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
        showToast(
          err instanceof Error ? err.message : "Couldn’t load shop details",
          "error"
        );
      }
    },
    [token, showToast]
  );

  const handleClosePopup = useCallback(() => {
    setSelectedShop(null);
  }, []);

  const refreshSelectedShop = useCallback(async () => {
    if (!selectedShop) return;
    try {
      const detail = await getShopById(selectedShop.id, token);
      setSelectedShop(detail);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Couldn’t refresh shop",
        "error"
      );
    }
  }, [selectedShop, token, showToast]);

  const handleRemoveCity = async (e: React.MouseEvent, city: FavoriteCity) => {
    e.stopPropagation();
    if (!token) return;
    try {
      await deleteFavoriteCity(token, city.id);
      setFavoriteCities((prev) => prev.filter((c) => c.id !== city.id));
      showToast("Removed saved city", "info");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not remove",
        "error"
      );
    }
  };

  if (error && shops.length === 0 && !loading) {
    return (
      <div className="flex items-center justify-center h-full bg-amber-50">
        <div className="text-center p-8">
          <p className="text-2xl mb-2">☕</p>
          <p className="text-amber-900 font-semibold mb-1">
            Couldn&apos;t load coffee shops
          </p>
          <p className="text-gray-500 text-sm">{error}</p>
          <p className="text-gray-400 text-xs mt-2">
            Make sure the backend is running and try again
          </p>
        </div>
      </div>
    );
  }

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
        onMove={(e) => setMapZoom(e.viewState.zoom)}
        onLoad={(e) => {
          setLoading(false);
          setMapZoom(e.target.getZoom());
          const map = e.target;
          void loadShopsForMap(map, false);
        }}
        onMoveEnd={scheduleReloadBounds}
      >
        <NavigationControl position="top-right" />

        {shops.map((shop) => (
          <Marker
            key={shop.id}
            latitude={shop.lat}
            longitude={shop.lng}
            anchor="bottom"
            onClick={(ev) => {
              ev.originalEvent.stopPropagation();
              void handleMarkerClick(shop);
            }}
          >
            <button
              type="button"
              className="flex flex-col items-center group cursor-pointer"
              aria-label={`View ${shop.name}`}
            >
              <span className="text-2xl group-hover:scale-125 transition-transform drop-shadow-md">
                ☕
              </span>
            </button>
          </Marker>
        ))}

        {showFavoriteCityMarkers &&
          favoriteCities.map((city) => (
            <Marker
              key={`city-${city.id}`}
              latitude={city.lat}
              longitude={city.lng}
              anchor="center"
              onClick={(ev) => {
                ev.originalEvent.stopPropagation();
                void focusCity(city.lat, city.lng, city.label);
              }}
            >
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-sky-600 text-white shadow-md hover:bg-sky-700 hover:scale-110 transition-transform"
                aria-label={`Go to saved city ${city.label}`}
                title={city.label}
              >
                <span className="text-sm font-bold leading-none">⌖</span>
              </button>
            </Marker>
          ))}
      </Map>

      {/* Saved cities — top right, only when user has saved cities */}
      {token && favoriteCities.length > 0 && (
        <div className="absolute top-3 right-12 z-30">
          <div className="relative">
            <button
              type="button"
              onClick={() => setCitiesMenuOpen((o) => !o)}
              className="rounded-xl border border-amber-200 bg-white/95 px-3 py-2 text-sm font-medium text-amber-900 shadow-lg hover:bg-amber-50 max-w-40 truncate"
              title="Saved cities"
            >
              Saved cities ▾
            </button>
            {citiesMenuOpen && (
              <ul className="absolute right-0 z-30 mt-1.5 max-h-64 min-w-48 overflow-y-auto rounded-xl border border-amber-200 bg-white py-1 shadow-xl">
                  {favoriteCities.map((city) => (
                    <li
                      key={city.id}
                      className="flex items-center gap-1 border-b border-amber-50 last:border-0"
                    >
                      <button
                        type="button"
                        className="flex-1 truncate px-3 py-2 text-left text-sm text-amber-900 hover:bg-amber-50"
                        onClick={() => {
                          setCitiesMenuOpen(false);
                          void focusCity(city.lat, city.lng, city.label);
                        }}
                      >
                        {city.label}
                      </button>
                      <button
                        type="button"
                        className="shrink-0 px-2 py-2 text-gray-400 hover:text-red-600"
                        aria-label={`Remove ${city.label}`}
                        onClick={(e) => void handleRemoveCity(e, city)}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-10">
          <div className="text-center px-4">
            <div className="mx-auto w-12 h-12 rounded-full border-2 border-amber-200 border-t-amber-800 animate-spin mb-3" />
            <p className="text-amber-900 font-semibold">Loading shops…</p>
            <p className="text-gray-500 text-sm mt-1">In the visible map area</p>
          </div>
        </div>
      )}

      {areaBusy && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 rounded-full border border-amber-200 bg-white/95 px-4 py-2 text-sm text-amber-900 shadow-lg backdrop-blur-sm">
          Loading spots for this area…
        </div>
      )}

      {selectedShop && (
        <div className="absolute top-4 left-4 z-20 max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] sm:max-w-md">
          <ShopPopupCard
            shop={selectedShop}
            onClose={handleClosePopup}
            onShopUpdated={refreshSelectedShop}
          />
        </div>
      )}
    </div>
  );
}
