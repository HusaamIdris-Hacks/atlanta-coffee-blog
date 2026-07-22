"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Coffee, Mail } from "lucide-react";
import NavBar from "@/components/NavBar";
import { requestPasswordReset } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 top-10 h-80 w-80 rounded-full bg-amber-300/25 blur-3xl animate-float-slow" />
        <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-orange-300/20 blur-3xl animate-float" />
      </div>

      <NavBar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-up">
          <div className="surface-card p-8 sm:p-9">
            {sent ? (
              /* ── Success state ── */
              <div className="text-center space-y-4">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                  <Mail size={30} />
                </div>
                <h1 className="text-2xl font-bold text-amber-900">Check your inbox</h1>
                <p className="text-gray-600 leading-relaxed">
                  If <span className="font-medium text-amber-900">{email}</span> is registered,
                  you&apos;ll receive a reset link shortly. It expires in 1 hour.
                </p>
                <p className="text-sm text-gray-500">
                  Don&apos;t see it? Check your spam folder.
                </p>
                <Link
                  href="/login"
                  className="btn-secondary mt-4 w-full justify-center"
                >
                  <ArrowLeft size={16} /> Back to sign in
                </Link>
              </div>
            ) : (
              /* ── Form state ── */
              <>
                <div className="text-center mb-8">
                  <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-br from-orange-400 to-amber-600 text-white shadow-lg shadow-amber-900/20">
                    <Coffee size={28} />
                  </div>
                  <h1 className="text-3xl font-bold text-amber-900">Forgot password?</h1>
                  <p className="text-gray-500 mt-2">
                    Enter your email and we&apos;ll send you a reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-amber-900 mb-1">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="input-field"
                      placeholder="you@example.com"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full rounded-xl py-3"
                  >
                    {submitting ? "Sending…" : "Send reset link"}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                  Remember your password?{" "}
                  <Link href="/login" className="text-amber-800 font-medium hover:underline">
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
