import Link from "next/link";

export const metadata = {
  title: "BeanCompassATL - Discover Atlanta's Best Coffee Shops",
  description: "Explore the finest coffee destinations across Atlanta with our interactive map. Find your new favorite spot.",
};

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-neutral/80 border-b border-primary-light/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-lg">☕</span>
            </div>
            <span className="text-2xl font-bold text-primary">BeanCompassATL</span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/map"
              className="px-6 py-2 rounded-full bg-primary text-neutral font-semibold hover:bg-primary-light transition-colors"
            >
              Start Exploring
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl sm:text-6xl font-bold text-primary leading-tight">
                  Navigate Atlanta's Coffee Culture
                </h1>
                <p className="text-xl text-text/70 mt-6 leading-relaxed">
                  Discover hidden gems and popular hotspots across Atlanta. Your compass to the perfect cup awaits.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/map"
                  className="px-8 py-3 rounded-full bg-accent text-text font-semibold hover:bg-primary-light transition-colors text-center"
                >
                  Explore the Map
                </Link>
                <button className="px-8 py-3 rounded-full border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-neutral transition-colors">
                  Learn More
                </button>
              </div>

              <div className="flex items-center gap-8 pt-8 border-t border-primary-light/30">
                <div>
                  <p className="text-3xl font-bold text-primary">20+</p>
                  <p className="text-text/60">Coffee Shops</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">100%</p>
                  <p className="text-text/60">Verified Reviews</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">⭐ 4.8</p>
                  <p className="text-text/60">Average Rating</p>
                </div>
              </div>
            </div>

            {/* Hero Image Placeholder */}
            <div className="relative h-96 sm:h-full min-h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-light to-accent shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-neutral/40">
                  <p className="text-6xl mb-4">☕</p>
                  <p className="text-xl font-semibold">Atlanta Coffee Map</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-primary/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-primary mb-4">
              Why BeanCompassATL?
            </h2>
            <p className="text-lg text-text/60 max-w-2xl mx-auto">
              More than just a map. Discover, save, and share your favorite coffee destinations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-neutral rounded-xl border border-primary-light/30 hover:border-accent transition-colors hover:shadow-lg">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">🗺️</span>
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">Interactive Map</h3>
              <p className="text-text/70">
                Explore coffee shops on an interactive map. Click on any location to see details, ratings, and reviews from the community.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-neutral rounded-xl border border-primary-light/30 hover:border-accent transition-colors hover:shadow-lg">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">❤️</span>
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">Save Favorites</h3>
              <p className="text-text/70">
                Build your personal collection of favorite spots. Keep track of places you love and want to revisit.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-neutral rounded-xl border border-primary-light/30 hover:border-accent transition-colors hover:shadow-lg">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">Community Reviews</h3>
              <p className="text-text/70">
                Read authentic reviews and ratings from other coffee enthusiasts. Share your own experiences and help the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-primary mb-6">
            Ready to Explore?
          </h2>
          <p className="text-xl text-text/70 mb-10 leading-relaxed">
            Start your coffee adventure today. Discover your next favorite spot in Atlanta.
          </p>
          <Link
            href="/map"
            className="inline-block px-10 py-4 rounded-full bg-primary text-neutral font-bold text-lg hover:bg-primary-light transition-colors shadow-lg hover:shadow-xl"
          >
            Open Interactive Map
          </Link>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-accent/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-primary-light/10 rounded-full blur-3xl"></div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary-light/20 bg-primary/5 px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold">☕</span>
                </div>
                <span className="text-lg font-bold text-primary">BeanCompassATL</span>
              </div>
              <p className="text-text/70">
                Your guide to discovering the best coffee shops across Atlanta.
              </p>
            </div>
            <div className="flex justify-end gap-8">
              <Link href="#" className="text-text/60 hover:text-primary transition-colors">
                About
              </Link>
              <Link href="#" className="text-text/60 hover:text-primary transition-colors">
                Contact
              </Link>
              <Link href="#" className="text-text/60 hover:text-primary transition-colors">
                Privacy
              </Link>
            </div>
          </div>
          <div className="border-t border-primary-light/20 pt-8 text-center text-text/60">
            <p>&copy; 2024 BeanCompassATL. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
