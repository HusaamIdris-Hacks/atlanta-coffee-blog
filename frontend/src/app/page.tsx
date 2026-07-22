import Link from "next/link";
import { ArrowRight, Coffee, Heart, Map as MapIcon, MessageSquareText, Star } from "lucide-react";
import AtlantaMapPreview from "@/components/AtlantaMapPreview";
import NavBar from "@/components/NavBar";
import Reveal from "@/components/Reveal";

export const metadata = {
  title: "BeanCompassATL - Discover Atlanta's Best Coffee Shops",
  description: "Explore the finest coffee destinations across Atlanta with our interactive map. Find your new favorite spot.",
};

const features = [
  {
    Icon: MapIcon,
    title: "Interactive Map",
    body: "Explore coffee shops on a live map. Tap any location for details, ratings, and reviews from the community.",
    tint: "from-amber-400/30 to-orange-400/20",
    iconColor: "text-amber-700",
  },
  {
    Icon: Heart,
    title: "Save Favorites",
    body: "Build your personal collection of go-to spots. Keep track of places you love and want to revisit.",
    tint: "from-rose-400/30 to-amber-400/20",
    iconColor: "text-rose-500",
  },
  {
    Icon: MessageSquareText,
    title: "Community Reviews",
    body: "Read authentic reviews from fellow coffee enthusiasts, and share your own to help others discover gems.",
    tint: "from-yellow-400/30 to-amber-500/20",
    iconColor: "text-amber-600",
  },
];

const stats = [
  { value: "20+", label: "Coffee Shops" },
  { value: "100%", label: "Verified Reviews" },
  { value: "4.8", label: "Average Rating", star: true },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Ambient animated background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-24 h-96 w-96 rounded-full bg-amber-300/25 blur-3xl animate-float-slow" />
        <div className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-orange-300/20 blur-3xl animate-float" />
        <div className="absolute -bottom-32 left-1/3 h-112 w-md rounded-full bg-amber-200/30 blur-3xl animate-float-slow" />
      </div>

      <NavBar variant="default" />

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/70 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-amber-800 backdrop-blur-sm shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500/70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-600" />
                  </span>
                  Atlanta Coffee Guide
                </span>
                <h1
                  className="animate-fade-up mt-5 text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] text-balance"
                  style={{ animationDelay: "80ms" }}
                >
                  Navigate Atlanta&apos;s <span className="gradient-text">Coffee Culture</span>
                </h1>
                <p
                  className="animate-fade-up text-lg sm:text-xl text-gray-600 mt-6 leading-relaxed max-w-xl text-balance"
                  style={{ animationDelay: "160ms" }}
                >
                  Discover hidden gems and beloved hotspots across the city. Your compass to the perfect cup awaits.
                </p>
              </div>

              <div
                className="animate-fade-up flex flex-col sm:flex-row gap-4"
                style={{ animationDelay: "240ms" }}
              >
                <Link href="/map" className="btn-primary px-8 py-3.5 text-center text-base group">
                  Explore the Map
                  <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link href="#features" className="btn-secondary px-8 py-3.5 text-center text-base">
                  Learn More
                </Link>
              </div>

              <div
                className="animate-fade-up grid grid-cols-3 gap-3 pt-8 border-t border-amber-200/70"
                style={{ animationDelay: "320ms" }}
              >
                {stats.map((s) => (
                  <div key={s.label} className="group">
                    <p className="flex items-center gap-1 text-3xl font-bold text-amber-900 transition-transform duration-300 group-hover:scale-110 group-hover:text-amber-700">
                      {s.star && <Star size={22} className="fill-amber-400 text-amber-400" />}
                      {s.value}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Map preview with floating accents */}
            <div
              className="animate-fade-up relative"
              style={{ animationDelay: "200ms" }}
            >
              <Link
                href="/map"
                className="group block h-96 sm:h-112 min-h-96 rounded-[1.75rem] overflow-hidden shadow-(--shadow-float) ring-1 ring-amber-200/60 transition-all duration-500 hover:-translate-y-1.5 hover:ring-amber-400/80"
              >
                <AtlantaMapPreview />
              </Link>

              {/* Floating glass cards */}
              <div className="absolute -left-4 sm:-left-8 top-10 hidden sm:flex animate-float items-center gap-3 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-xl backdrop-blur-md">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-700">
                  <Coffee size={20} />
                </span>
                <div>
                  <p className="text-sm font-bold text-amber-900 leading-none">20+ spots</p>
                  <p className="text-xs text-gray-500 mt-1">mapped citywide</p>
                </div>
              </div>
              <div
                className="absolute -right-3 sm:-right-6 bottom-8 hidden sm:flex animate-float-slow items-center gap-3 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-xl backdrop-blur-md"
                style={{ animationDelay: "1s" }}
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-rose-100 text-amber-600">
                  <Star size={20} className="fill-amber-400 text-amber-400" />
                </span>
                <div>
                  <p className="text-sm font-bold text-amber-900 leading-none">4.8 avg</p>
                  <p className="text-xs text-gray-500 mt-1">community rated</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
              Everything you need
            </span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-bold text-amber-900">
              Why BeanCompassATL?
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto text-balance">
              More than just a map — discover, save, and share your favorite coffee destinations.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 120}>
                <div className="surface-card card-hover group h-full p-8">
                  <div
                    className={`mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-br ${f.tint} ${f.iconColor} shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6`}
                  >
                    <f.Icon size={26} />
                  </div>
                  <h3 className="text-xl font-bold text-amber-900 mb-3">{f.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20">
        <Reveal className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-4xl bg-linear-to-br from-amber-800 via-amber-900 to-[#3a2414] px-8 py-16 sm:px-16 sm:py-20 text-center shadow-(--shadow-float)">
            {/* decorative glow */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -top-10 right-10 h-40 w-40 rounded-full bg-orange-400/30 blur-3xl animate-float" />
              <div className="absolute bottom-0 left-10 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl animate-float-slow" />
            </div>
            <div className="relative">
              <h2 className="text-4xl sm:text-5xl font-bold text-amber-50">Ready to Explore?</h2>
              <p className="mt-5 text-lg sm:text-xl text-amber-100/80 max-w-2xl mx-auto leading-relaxed text-balance">
                Start your coffee adventure today. Discover your next favorite spot in Atlanta.
              </p>
              <Link
                href="/map"
                className="mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-amber-50 px-10 py-4 text-lg font-semibold text-amber-900 shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-2xl group"
              >
                Open Interactive Map
                <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-amber-200/70 bg-white/40 px-4 sm:px-6 lg:px-8 py-12 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-linear-to-br from-orange-400 to-amber-600 text-white">
                  <Coffee size={16} />
                </div>
                <span className="text-lg font-bold text-amber-900">BeanCompassATL</span>
              </div>
              <p className="text-gray-600 max-w-sm">
                Your guide to discovering the best coffee shops across Atlanta.
              </p>
            </div>
            <div className="flex md:justify-end gap-8">
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
          <div className="border-t border-amber-200/70 pt-8 text-center text-gray-500">
            <p>&copy; 2026 BeanCompassATL. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
