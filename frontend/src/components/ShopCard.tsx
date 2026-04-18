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
      className="block overflow-hidden surface-card-subtle hover:shadow-lg hover:-translate-y-0.5 hover:border-amber-300"
    >
      <div className="bg-linear-to-r from-amber-800 to-amber-700 px-4 py-3">
        <h3 className="text-white font-bold text-base">{shop.name}</h3>
      </div>
      <div className="p-4 space-y-2">
        <p className="text-sm text-gray-600 line-clamp-2">{shop.address}</p>
        {shop.avg_rating !== null ? (
          <p className="text-sm text-amber-700">
            {"★".repeat(Math.round(shop.avg_rating))}
            {"☆".repeat(5 - Math.round(shop.avg_rating))}{" "}
            {shop.avg_rating.toFixed(1)}
          </p>
        ) : (
          <p className="text-sm text-gray-400 italic">No ratings yet</p>
        )}
      </div>
    </Link>
  );
}
