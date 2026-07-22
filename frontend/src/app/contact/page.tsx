import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import NavBar from "@/components/NavBar";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Contact - BeanCompassATL",
  description: "Get in touch with the BeanCompassATL team.",
};

export default function ContactPage() {
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
              <ArrowLeft size={16} /> Return to home
            </Link>
          </div>
        </Reveal>
      </main>
    </div>
  );
}
