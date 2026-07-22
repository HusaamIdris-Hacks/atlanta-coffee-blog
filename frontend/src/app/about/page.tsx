import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, PenLine, Search, Bookmark } from "lucide-react";
import NavBar from "@/components/NavBar";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "About - BeanCompassATL",
  description:
    "Learn about BeanCompassATL and our mission to help coffee lovers discover great shops.",
};

export default function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-16 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl animate-float-slow" />
        <div className="absolute -right-20 top-40 h-80 w-80 rounded-full bg-orange-300/15 blur-3xl animate-float" />
      </div>
      <NavBar />
      <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
        <Reveal as="section" className="surface-card p-8 sm:p-10">
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
            <article className="surface-card-subtle card-hover p-5">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-100 text-amber-700">
                <Search size={22} />
              </span>
              <h2 className="mt-3 text-sm font-semibold text-amber-900">Discover</h2>
              <p className="mt-2 text-sm text-gray-600">
                Browse coffee shops by map area and city.
              </p>
            </article>
            <article className="surface-card-subtle card-hover p-5">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-rose-100 text-rose-500">
                <Bookmark size={22} />
              </span>
              <h2 className="mt-3 text-sm font-semibold text-amber-900">Save</h2>
              <p className="mt-2 text-sm text-gray-600">
                Keep track of favorites for future visits.
              </p>
            </article>
            <article className="surface-card-subtle card-hover p-5">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-100 text-amber-600">
                <PenLine size={22} />
              </span>
              <h2 className="mt-3 text-sm font-semibold text-amber-900">Share</h2>
              <p className="mt-2 text-sm text-gray-600">
                Leave reviews to help other coffee lovers.
              </p>
            </article>
          </div>
          <div className="mt-8 border-t border-amber-200 pt-6">
            <Link href="/" className="btn-secondary">
              <ArrowLeft size={16} /> Return to home
            </Link>
          </div>
        </Reveal>
      </main>
    </div>
  );
}
