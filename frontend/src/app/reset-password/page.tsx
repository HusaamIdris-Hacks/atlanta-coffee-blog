"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { CheckCircle, Coffee, KeyRound } from "lucide-react";
import NavBar from "@/components/NavBar";
import { resetPassword } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-100 text-red-500">
          <KeyRound size={30} />
        </div>
        <h1 className="text-2xl font-bold text-amber-900">Invalid link</h1>
        <p className="text-gray-600">
          This reset link is missing its token. Please request a new one.
        </p>
        <Link href="/forgot-password" className="btn-primary inline-flex mt-2">
          Request new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle size={30} />
        </div>
        <h1 className="text-2xl font-bold text-amber-900">Password updated!</h1>
        <p className="text-gray-600">You can now sign in with your new password.</p>
        <Link href="/login" className="btn-primary inline-flex mt-2">
          Sign in
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed. The link may have expired.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-br from-orange-400 to-amber-600 text-white shadow-lg shadow-amber-900/20">
          <Coffee size={28} />
        </div>
        <h1 className="text-3xl font-bold text-amber-900">Set new password</h1>
        <p className="text-gray-500 mt-2">Choose a strong password for your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-amber-900 mb-1">
            New password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className="input-field"
            placeholder="At least 6 characters"
          />
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-amber-900 mb-1">
            Confirm new password
          </label>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className="input-field"
            placeholder="Repeat your password"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full rounded-xl py-3"
        >
          {submitting ? "Updating…" : "Update password"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Link expired?{" "}
        <Link href="/forgot-password" className="text-amber-800 font-medium hover:underline">
          Request a new one
        </Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
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
            <Suspense fallback={<p className="text-center text-gray-500">Loading…</p>}>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
