"use client";

import Link from "next/link";
import { getAvatarUrl } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface NavBarProps {
  variant?: "default" | "map";
}

export default function NavBar({ variant = "default" }: NavBarProps) {
  const { user, loading, logout, error, clearError } = useAuth();

  const logo = (
    <Link href="/" className="flex items-center gap-2">
      <div
        className={`bg-orange-500 rounded-full flex items-center justify-center ${
          variant === "map" ? "w-7 h-7" : "w-8 h-8"
        }`}
      >
        <span
          className={`text-amber-900 font-bold ${
            variant === "map" ? "text-sm" : "text-lg"
          }`}
        >
          ☕
        </span>
      </div>
      <span
        className={`font-bold text-amber-900 ${
          variant === "map" ? "text-xl" : "text-2xl"
        }`}
      >
        Brew ATL
      </span>
    </Link>
  );

  return (
    <>
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-amber-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        {logo}
        <div className="flex items-center gap-4">
          {variant === "default" && (
            <Link
              href="/map"
              className="px-6 py-2 rounded-full bg-amber-800 text-white font-semibold hover:bg-amber-700 transition-colors"
            >
              Start Exploring
            </Link>
          )}
          {variant === "map" && (
            <p className="text-sm text-gray-500 hidden sm:block">
              Click a marker to view shop details
            </p>
          )}
          {loading ? (
            <span className="text-sm text-gray-400">Loading...</span>
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div
                  className="w-8 h-8 rounded-full overflow-hidden border-2 shrink-0"
                  style={{
                    borderColor: user.profile_ring_color || "#D97706",
                  }}
                >
                  {user.profile_picture ? (
                    <img
                      src={getAvatarUrl(user.profile_picture) ?? ""}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="w-full h-full rounded-full bg-amber-200 flex items-center justify-center text-amber-800 text-sm font-medium">
                      {(user.name || user.email)?.[0]?.toUpperCase() ?? "?"}
                    </span>
                  )}
                </div>
                <span className="text-sm text-amber-900 hidden sm:inline font-medium hover:text-amber-700 hover:underline">
                  {user.name || user.email}
                </span>
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm rounded-full border border-amber-800 text-amber-800 hover:bg-amber-800 hover:text-white transition-colors"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm rounded-full border border-amber-800 text-amber-800 hover:bg-amber-800 hover:text-white transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm rounded-full bg-amber-800 text-white hover:bg-amber-700 transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
    {error && (
      <div className="bg-amber-100 border-b border-amber-300 px-4 py-2 flex items-center justify-between max-w-7xl mx-auto">
        <p className="text-sm text-amber-900">{error}</p>
        <button
          onClick={clearError}
          className="text-amber-800 hover:text-amber-900 font-medium text-sm"
          aria-label="Dismiss"
        >
          Dismiss
        </button>
      </div>
    )}
    </>
  );
}
