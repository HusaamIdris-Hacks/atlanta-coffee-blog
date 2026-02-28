"use client";

import { useEffect, useState } from "react";
import Map, { Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

import { getShops } from "@/lib/api";
import type { CoffeeShop } from "@/lib/api";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

const ATLANTA_CENTER = {
  latitude: 33.749,
  longitude: -84.388,
};

export default function AtlantaMapPreview() {
  const [shops, setShops] = useState<CoffeeShop[]>([]);

  useEffect(() => {
    getShops()
      .then(setShops)
      .catch(() => {});
  }, []);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full min-h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-amber-600 to-orange-500 flex items-center justify-center">
        <p className="text-white/70 text-sm">Add NEXT_PUBLIC_MAPBOX_TOKEN to see map</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-96 rounded-2xl overflow-hidden shadow-2xl">
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
            <span className="text-xl drop-shadow-md">☕</span>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
