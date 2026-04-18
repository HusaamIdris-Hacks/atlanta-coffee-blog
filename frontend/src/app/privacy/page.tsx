import type { Metadata } from "next";
import Link from "next/link";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Privacy - BeanCompassATL",
  description: "Privacy practices for BeanCompassATL.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
        <section className="surface-card p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
            Privacy
          </p>
          <h1 className="mt-3 text-4xl font-bold text-amber-900 sm:text-5xl">
            Your privacy matters.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-gray-700 sm:text-lg">
            BeanCompassATL stores only what is needed to provide core features like
            accounts, favorites, and reviews. We do not sell personal information.
          </p>
          <div className="mt-8 space-y-4">
            <article className="surface-card-subtle p-5">
              <h2 className="text-base font-semibold text-amber-900">Data we collect</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Account details, profile settings, favorites, and review content you
                create in the app.
              </p>
            </article>
            <article className="surface-card-subtle p-5">
              <h2 className="text-base font-semibold text-amber-900">How we use data</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                To provide map discovery, personalize your account experience, and
                improve app quality.
              </p>
            </article>
            <article className="surface-card-subtle p-5">
              <h2 className="text-base font-semibold text-amber-900">Your control</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                You can update profile information and remove your own reviews and
                favorites at any time.
              </p>
            </article>
          </div>
          <p className="mt-6 text-xs text-gray-500">Last updated: April 2026</p>
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
