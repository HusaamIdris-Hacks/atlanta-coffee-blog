"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

import { getShops, getShopById } from "@/lib/api";
import type { CoffeeShop, CoffeeShopDetail } from "@/lib/api";
import ShopPopupCard from "./ShopPopupCard";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

const ATLANTA_CENTER = {
  latitude: 33.749,
  longitude: -84.388,
};

export default function CoffeeMap() {
  const mapRef = useRef<MapRef>(null);
  const [shops, setShops] = useState<CoffeeShop[]>([]);
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

  const handleMarkerClick = useCallback(async (shop: CoffeeShop) => {
    try {
      const detail = await getShopById(shop.id);
      setSelectedShop(detail);

      mapRef.current?.flyTo({
        center: [shop.lng, shop.lat],
        zoom: 14,
        duration: 800,
      });
    } catch (err) {
      console.error("Failed to load shop details:", err);
    }
  }, []);

  const handleClosePopup = useCallback(() => {
    setSelectedShop(null);
  }, []);

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

        {shops.map((shop) => (
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
              aria-label={`View ${shop.name}`}
            >
              <span className="text-2xl group-hover:scale-125 transition-transform drop-shadow-md">
                ☕
              </span>
            </button>
          </Marker>
        ))}
      </Map>

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
          <ShopPopupCard shop={selectedShop} onClose={handleClosePopup} />
        </div>
      )}
    </div>
  );
}
