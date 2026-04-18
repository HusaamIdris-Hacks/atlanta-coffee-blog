import Link from "next/link";
import AtlantaMapPreview from "@/components/AtlantaMapPreview";
import NavBar from "@/components/NavBar";

export const metadata = {
  title: "BeanCompassATL - Discover Atlanta's Best Coffee Shops",
  description: "Explore the finest coffee destinations across Atlanta with our interactive map. Find your new favorite spot.",
};

export default function Home() {
  return (
    <div className="min-h-screen">
      <NavBar variant="default" />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <span className="inline-flex items-center rounded-full border border-amber-200 bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-amber-800">
                  Atlanta Coffee Guide
                </span>
                <h1 className="mt-4 text-5xl sm:text-6xl font-bold text-amber-900 leading-tight">
                  Navigate Atlanta's Coffee Culture
                </h1>
                <p className="text-xl text-gray-600 mt-6 leading-relaxed">
                  Discover hidden gems and popular hotspots across Atlanta. Your compass to the perfect cup awaits.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/map"
                  className="btn-primary px-8 py-3 text-center"
                >
                  Explore the Map
                </Link>
                <Link href="#features" className="btn-secondary px-8 py-3 text-center">
                  Learn More
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-8 border-t border-amber-200/80">
                <div>
                  <p className="text-3xl font-bold text-amber-900">20+</p>
                  <p className="text-gray-500">Coffee Shops</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-amber-900">100%</p>
                  <p className="text-gray-500">Verified Reviews</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-amber-900">⭐ 4.8</p>
                  <p className="text-gray-500">Average Rating</p>
                </div>
              </div>
            </div>

            {/* Atlanta Map Preview */}
            <Link href="/map" className="block h-96 sm:h-112 min-h-96 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-amber-200/60 hover:-translate-y-1 hover:ring-amber-400/80">
              <AtlantaMapPreview />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 sm:px-6 lg:px-8 py-20 bg-amber-50/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-amber-900 mb-4">
              Why BeanCompassATL?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              More than just a map. Discover, save, and share your favorite coffee destinations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="surface-card p-8 hover:-translate-y-1">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">🗺️</span>
              </div>
              <h3 className="text-xl font-bold text-amber-900 mb-3">Interactive Map</h3>
              <p className="text-gray-700">
                Explore coffee shops on an interactive map. Click on any location to see details, ratings, and reviews from the community.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="surface-card p-8 hover:-translate-y-1">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">❤️</span>
              </div>
              <h3 className="text-xl font-bold text-amber-900 mb-3">Save Favorites</h3>
              <p className="text-gray-700">
                Build your personal collection of favorite spots. Keep track of places you love and want to revisit.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="surface-card p-8 hover:-translate-y-1">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-bold text-amber-900 mb-3">Community Reviews</h3>
              <p className="text-gray-700">
                Read authentic reviews and ratings from other coffee enthusiasts. Share your own experiences and help the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20 overflow-hidden bg-white">
        <div className="max-w-4xl mx-auto text-center surface-card p-10 sm:p-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-amber-900 mb-6">
            Ready to Explore?
          </h2>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Start your coffee adventure today. Discover your next favorite spot in Atlanta.
          </p>
          <Link
            href="/map"
            className="btn-primary px-10 py-4 text-lg"
          >
            Open Interactive Map
          </Link>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-orange-100 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-amber-100 rounded-full blur-3xl"></div>
      </section>

      {/* Footer */}
      <footer className="border-t border-amber-200 bg-amber-50 px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-amber-900 font-bold">☕</span>
                </div>
                <span className="text-lg font-bold text-amber-900">BeanCompassATL</span>
              </div>
              <p className="text-gray-600">
                Your guide to discovering the best coffee shops across Atlanta.
              </p>
            </div>
            <div className="flex justify-end gap-8">
              <Link href="/about" className="text-gray-500 hover:text-amber-900 transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-gray-500 hover:text-amber-900 transition-colors">
                Contact
              </Link>
              <Link href="/privacy" className="text-gray-500 hover:text-amber-900 transition-colors">
                Privacy
              </Link>
            </div>
          </div>
          <div className="border-t border-amber-200 pt-8 text-center text-gray-500">
            <p>&copy; 2026 BeanCompassATL. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
