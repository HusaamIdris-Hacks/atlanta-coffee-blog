import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import Stars from "@/components/Stars";
import type { CoffeeShopDetail } from "@/lib/api";

interface ShopCardProps {
  shop: CoffeeShopDetail;
}

export default function ShopCard({ shop }: ShopCardProps) {
  const mapUrl = `/map?shop=${shop.id}&lat=${shop.lat}&lng=${shop.lng}`;

  return (
    <Link
      href={mapUrl}
      className="group block overflow-hidden surface-card-subtle card-hover hover:border-amber-300"
    >
      <div className="relative overflow-hidden bg-linear-to-r from-amber-800 to-amber-700 px-4 py-3.5">
        <div
          aria-hidden
          className="absolute -right-6 -top-8 h-20 w-20 rounded-full bg-white/10 blur-xl transition-transform duration-500 group-hover:scale-150"
        />
        <h3 className="relative text-white font-bold text-base leading-snug pr-6">{shop.name}</h3>
        <ArrowRight
          size={18}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/70 transition-transform duration-300 group-hover:translate-x-1"
        />
      </div>
      <div className="p-4 space-y-2">
        <p className="text-sm text-gray-600 line-clamp-2 flex items-start gap-1.5">
          <MapPin size={15} className="mt-0.5 shrink-0 text-amber-600/70" />
          <span>{shop.address}</span>
        </p>
        {shop.avg_rating !== null ? (
          <div className="flex items-center gap-1.5 text-sm font-medium text-amber-700">
            <Stars value={shop.avg_rating} size={15} />
            {shop.avg_rating.toFixed(1)}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">No ratings yet</p>
        )}
      </div>
    </Link>
  );
}
