import { Suspense } from "react";
import CoffeeMap from "@/components/CoffeeMap";
import NavBar from "@/components/NavBar";
import { MapPageBridgeProvider } from "@/contexts/MapPageBridgeContext";

export const metadata = {
  title: "Map - BeanCompassATL",
  description: "Explore Atlanta coffee shops on an interactive map.",
};

export default function MapPage() {
  return (
    <MapPageBridgeProvider>
      <div className="h-screen flex flex-col">
        <NavBar variant="map" />
        <main className="flex-1 relative">
          <Suspense
            fallback={
              <div className="h-full flex items-center justify-center bg-amber-50 text-amber-900">
                Loading map…
              </div>
            }
          >
            <CoffeeMap />
          </Suspense>
        </main>
      </div>
    </MapPageBridgeProvider>
  );
}
