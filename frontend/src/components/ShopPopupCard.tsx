"use client";

import type { CoffeeShopDetail } from "@/lib/api";

interface ShopPopupCardProps {
  shop: CoffeeShopDetail;
  onClose: () => void;
}

export default function ShopPopupCard({ shop, onClose }: ShopPopupCardProps) {
  return (
    <div className="w-72 rounded-xl bg-white shadow-xl border border-amber-200 overflow-hidden">
      {/* Header */}
      <div className="bg-linear-to-r from-amber-800 to-amber-700 px-4 py-3 flex items-start justify-between">
        <h3 className="text-white font-bold text-base leading-tight pr-2">
          {shop.name}
        </h3>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white text-lg leading-none shrink-0"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className="p-4 space-y-3">
        {/* Address */}
        <p className="text-sm text-gray-600 flex items-start gap-1.5">
          <span className="shrink-0">📍</span>
          <span>{shop.address}</span>
        </p>

        {/* Rating */}
        {shop.avg_rating !== null ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-amber-500">
              {"★".repeat(Math.round(shop.avg_rating))}
              {"☆".repeat(5 - Math.round(shop.avg_rating))}
            </span>
            <span className="text-gray-600">
              {shop.avg_rating.toFixed(1)} ({shop.review_count}{" "}
              {shop.review_count === 1 ? "review" : "reviews"})
            </span>
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">No reviews yet</p>
        )}

        {/* Description */}
        {shop.description && (
          <p className="text-sm text-gray-700 leading-relaxed">
            {shop.description}
          </p>
        )}

        {/* Website link */}
        {shop.website && (
          <a
            href={shop.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-800 hover:text-orange-600 transition-colors"
          >
            🌐 Visit Website
          </a>
        )}
      </div>
    </div>
  );
}
