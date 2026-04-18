"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type MapPageBridge = {
  focusCity: (lat: number, lng: number, label?: string) => Promise<void>;
  reloadSavedCities: () => Promise<void>;
};

const MapPageBridgeContext = createContext<{
  bridge: MapPageBridge | null;
  setBridge: (b: MapPageBridge | null) => void;
} | null>(null);

export function MapPageBridgeProvider({ children }: { children: ReactNode }) {
  const [bridge, setBridge] = useState<MapPageBridge | null>(null);
  const value = useMemo(() => ({ bridge, setBridge }), [bridge]);
  return (
    <MapPageBridgeContext.Provider value={value}>
      {children}
    </MapPageBridgeContext.Provider>
  );
}

export function useMapPageBridge() {
  return useContext(MapPageBridgeContext);
}
