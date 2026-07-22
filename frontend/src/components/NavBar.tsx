"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Coffee, User } from "lucide-react";
import MapCitySearch from "@/components/MapCitySearch";
import { useAuth } from "@/contexts/AuthContext";
import { useMapPageBridge } from "@/contexts/MapPageBridgeContext";
import { useToast } from "@/contexts/ToastContext";
import { getAvatarUrl } from "@/lib/api";

const DEFAULT_RING = "#D97706";

interface NavBarProps {
  variant?: "default" | "map";
}

export default function NavBar({ variant = "default" }: NavBarProps) {
  const { user, loading, logout, error, clearError } = useAuth();
  const { showToast } = useToast();
  const mapBridge = useMapPageBridge();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const logo = (
    <Link href="/" className="group flex items-center gap-2">
      <div
        className={`grid place-items-center rounded-full bg-linear-to-br from-orange-400 to-amber-600 text-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 ${
          variant === "map" ? "w-7 h-7" : "w-9 h-9"
        }`}
      >
        <Coffee size={variant === "map" ? 15 : 18} />
      </div>
      <span
        className={`font-bold text-amber-900 tracking-tight transition-colors group-hover:text-amber-700 ${
          variant === "map" ? "text-xl" : "text-2xl"
        }`}
      >
        BeanCompassATL
      </span>
    </Link>
  );

  return (
    <>
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-amber-900/10 bg-white/80 shadow-sm shadow-amber-900/5 backdrop-blur-xl"
          : "border-b border-transparent bg-white/40 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center gap-3">
        {logo}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 justify-end">
          {variant === "default" && (
            <Link
              href="/map"
              className="btn-primary shrink-0"
            >
              Start Exploring
            </Link>
          )}
          {variant === "map" && mapBridge?.bridge && (
            <MapCitySearch bridge={mapBridge.bridge} />
          )}
          {loading ? (
            <span className="text-sm text-gray-400">Loading...</span>
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link href="/profile" className="flex items-center gap-2.5 group rounded-full px-2 py-1.5 hover:bg-amber-50/80">
                <div
                  className="w-8 h-8 rounded-full overflow-hidden bg-amber-100 border-2 shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm"
                  style={{
                    borderColor: user.profile_ring_color || DEFAULT_RING,
                  }}
                >
                  {user.profile_picture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getAvatarUrl(user.profile_picture) || ""}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={16} className="text-amber-600" />
                  )}
                </div>
                <span className="text-sm text-amber-900 hidden sm:inline font-medium group-hover:text-amber-700">
                  {user.name || user.email}
                </span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  showToast("Signed out", "success");
                }}
                className="btn-secondary text-sm px-4 py-1.5"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="btn-secondary text-sm px-4 py-2"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="btn-primary text-sm px-4 py-2"
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
