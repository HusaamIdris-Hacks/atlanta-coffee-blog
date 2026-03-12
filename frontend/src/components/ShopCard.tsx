"use client";

import Link from "next/link";
import type { CoffeeShopDetail } from "@/lib/api";

interface ShopCardProps {
  shop: CoffeeShopDetail;
}

export default function ShopCard({ shop }: ShopCardProps) {
  const mapUrl = `/map?shop=${shop.id}&lat=${shop.lat}&lng=${shop.lng}`;

  return (
    <Link
      href={mapUrl}
      className="block w-full rounded-xl bg-white border border-amber-200 shadow-md hover:shadow-lg hover:border-amber-300 transition-all overflow-hidden"
    >
      <div className="bg-linear-to-r from-amber-800 to-amber-700 px-4 py-3">
        <h3 className="text-white font-bold text-base">{shop.name}</h3>
      </div>
      <div className="p-4 space-y-2">
        <p className="text-sm text-gray-600 flex items-start gap-1.5">
          <span className="shrink-0">📍</span>
          <span className="line-clamp-2">{shop.address}</span>
        </p>
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
        {shop.description && (
          <p className="text-sm text-gray-700 line-clamp-2">{shop.description}</p>
        )}
        <p className="text-xs font-medium text-amber-800 pt-1">
          View on map →
        </p>
      </div>
    </Link>
  );
}
