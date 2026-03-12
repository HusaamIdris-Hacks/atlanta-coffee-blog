import CoffeeMap from "@/components/CoffeeMap";
import NavBar from "@/components/NavBar";

export const metadata = {
  title: "Map - Brew ATL",
  description: "Explore Atlanta coffee shops on an interactive map.",
};

export default function MapPage() {
  return (
    <div className="h-screen flex flex-col">
      <NavBar variant="map" />
      <main className="flex-1 relative">
        <CoffeeMap />
      </main>
    </div>
  );
}
