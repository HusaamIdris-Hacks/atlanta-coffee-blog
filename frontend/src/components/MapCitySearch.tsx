"use client";

import { useEffect, useRef, useState } from "react";
import { addFavoriteCity } from "@/lib/api";
import { searchUsPlaces, type GeocodePlace } from "@/lib/mapGeocode";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import type { MapPageBridge } from "@/contexts/MapPageBridgeContext";

export default function MapCitySearch({ bridge }: { bridge: MapPageBridge }) {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<GeocodePlace[]>([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      if (q.trim().length < 2) {
        setHits([]);
        return;
      }
      void searchUsPlaces(q).then(setHits);
    }, 280);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const savePlace = async (place: GeocodePlace) => {
    if (!token) {
      showToast("Sign in to save cities", "info");
      return;
    }
    try {
      await addFavoriteCity(token, {
        label: place.label,
        lat: place.lat,
        lng: place.lng,
      });
      await bridge.reloadSavedCities();
      showToast("City saved", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not save city",
        "error"
      );
    }
  };

  return (
    <div ref={wrapRef} className="relative min-w-0 max-w-56 sm:max-w-xs w-full">
      <label htmlFor="nav-city-search" className="sr-only">
        Search US city
      </label>
      <input
        id="nav-city-search"
        type="search"
        autoComplete="off"
        placeholder="City…"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="w-full rounded-xl border border-amber-200/80 bg-white/95 px-3 py-2 text-sm text-amber-950 placeholder:text-gray-500 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-300/40"
      />
      {open && hits.length > 0 && (
        <ul className="absolute right-0 z-60 mt-1.5 max-h-52 w-[min(100vw-2rem,18rem)] overflow-y-auto rounded-xl border border-amber-200 bg-white/95 py-1 shadow-xl backdrop-blur-sm">
          {hits.map((place) => (
            <li
              key={`${place.lat}-${place.lng}-${place.label}`}
              className="border-b border-amber-50 last:border-0"
            >
              <div className="flex items-stretch">
                <button
                  type="button"
                  className="min-w-0 flex-1 truncate px-3 py-2 text-left text-sm text-amber-900 hover:bg-amber-50"
                  onClick={() => {
                    setOpen(false);
                    setQ(place.label.split(",")[0] || place.label);
                    void bridge.focusCity(place.lat, place.lng, place.label);
                  }}
                >
                  {place.label}
                </button>
                {token ? (
                  <button
                    type="button"
                    onClick={() => void savePlace(place)}
                    className="shrink-0 border-l border-amber-100 px-2 text-xs font-medium text-sky-700 hover:bg-sky-50/80"
                    title="Save city"
                  >
                    Save
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
