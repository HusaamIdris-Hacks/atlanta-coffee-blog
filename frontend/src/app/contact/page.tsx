import type { Metadata } from "next";
import Link from "next/link";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Contact - BeanCompassATL",
  description: "Get in touch with the BeanCompassATL team.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
        <section className="surface-card p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
            Contact
          </p>
          <h1 className="mt-3 text-4xl font-bold text-amber-900 sm:text-5xl">
            We&apos;d love to hear from you.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-gray-700 sm:text-lg">
            Send feedback, report an issue, or suggest a coffee shop to add to the map.
            We review all submissions and use them to improve the product experience.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <article className="surface-card-subtle p-5">
              <h2 className="text-sm font-semibold text-amber-900">General inquiries</h2>
              <p className="mt-2 text-sm text-gray-600">hello@beancompassatl.com</p>
            </article>
            <article className="surface-card-subtle p-5">
              <h2 className="text-sm font-semibold text-amber-900">Support</h2>
              <p className="mt-2 text-sm text-gray-600">support@beancompassatl.com</p>
            </article>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            Response time is typically 1-2 business days.
          </p>
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
