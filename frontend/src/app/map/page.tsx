import Link from "next/link";
import CoffeeMap from "@/components/CoffeeMap";

export const metadata = {
  title: "Map - BeanCompassATL",
  description: "Explore Atlanta coffee shops on an interactive map.",
};

export default function MapPage() {
  return (
    <div className="h-screen flex flex-col">
      {/* Nav bar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-amber-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-amber-900 font-bold text-sm">☕</span>
            </div>
            <span className="text-xl font-bold text-amber-900">
              BeanCompassATL
            </span>
          </Link>
          <p className="text-sm text-gray-500 hidden sm:block">
            Click a marker to view shop details
          </p>
        </div>
      </nav>

      {/* Map fills remaining space */}
      <main className="flex-1 relative">
        <CoffeeMap />
      </main>
    </div>
  );
}
