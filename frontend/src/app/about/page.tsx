import type { Metadata } from "next";
import Link from "next/link";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "About - BeanCompassATL",
  description:
    "Learn about BeanCompassATL and our mission to help coffee lovers discover great shops.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
        <section className="surface-card p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
            About BeanCompassATL
          </p>
          <h1 className="mt-3 text-4xl font-bold text-amber-900 sm:text-5xl">
            Helping Atlanta find better coffee.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-gray-700 sm:text-lg">
            BeanCompassATL is a city-focused coffee map built for people who want to
            discover new spots quickly. We blend location-based browsing, community
            reviews, and favorites into one simple map experience.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <article className="surface-card-subtle p-4">
              <h2 className="text-sm font-semibold text-amber-900">Discover</h2>
              <p className="mt-2 text-sm text-gray-600">
                Browse coffee shops by map area and city.
              </p>
            </article>
            <article className="surface-card-subtle p-4">
              <h2 className="text-sm font-semibold text-amber-900">Save</h2>
              <p className="mt-2 text-sm text-gray-600">
                Keep track of favorites for future visits.
              </p>
            </article>
            <article className="surface-card-subtle p-4">
              <h2 className="text-sm font-semibold text-amber-900">Share</h2>
              <p className="mt-2 text-sm text-gray-600">
                Leave reviews to help other coffee lovers.
              </p>
            </article>
          </div>
          <div className="mt-8 border-t border-amber-200 pt-6">
            <Link href="/" className="btn-secondary">
              ← Return to home
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
