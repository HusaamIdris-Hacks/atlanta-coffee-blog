"use client";

import { useEffect, useState } from "react";
import Map, { Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

import { getShopsInBounds } from "@/lib/api";
import type { CoffeeShop } from "@/lib/api";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

const ATLANTA_CENTER = {
  latitude: 33.749,
  longitude: -84.388,
};

export default function AtlantaMapPreview() {
  const [shops, setShops] = useState<CoffeeShop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getShopsInBounds({
      min_lat: 33.45,
      max_lat: 33.95,
      min_lng: -84.75,
      max_lng: -84.15,
    })
      .then(setShops)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full min-h-96 rounded-2xl overflow-hidden bg-linear-to-br from-amber-600 to-orange-500 flex items-center justify-center">
        <p className="text-white/70 text-sm">Add NEXT_PUBLIC_MAPBOX_TOKEN to see map</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-96 rounded-2xl overflow-hidden shadow-2xl">
      <div className="pointer-events-none absolute inset-0 z-10 bg-linear-to-t from-black/25 via-transparent to-transparent" />
      {loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-amber-50/90 backdrop-blur-sm">
          <div className="w-10 h-10 rounded-full border-2 border-amber-200 border-t-amber-800 animate-spin mb-2" />
          <p className="text-sm font-medium text-amber-900">Loading map preview…</p>
        </div>
      )}
      <Map
        initialViewState={{
          ...ATLANTA_CENTER,
          zoom: 10.5,
        }}
        style={{ width: "100%", height: "100%", minHeight: 384 }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        {shops.map((shop) => (
          <Marker
            key={shop.id}
            latitude={shop.lat}
            longitude={shop.lng}
            anchor="bottom"
          >
            <span className="text-xl drop-shadow-md transition-transform duration-200 hover:scale-110">☕</span>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
