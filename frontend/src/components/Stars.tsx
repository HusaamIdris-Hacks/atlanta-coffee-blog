import { Star } from "lucide-react";

interface StarsProps {
  /** Rating value; supports halves via rounding to nearest whole for fill. */
  value: number;
  /** Number of stars to render. */
  max?: number;
  /** Icon size in pixels. */
  size?: number;
  className?: string;
}

/** Read-only star rating display using filled/empty lucide stars. */
export default function Stars({ value, max = 5, size = 16, className = "" }: StarsProps) {
  const rounded = Math.round(value);
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-hidden>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < rounded;
        return (
          <Star
            key={i}
            size={size}
            className={filled ? "fill-amber-400 text-amber-400" : "fill-none text-amber-200"}
            strokeWidth={2}
          />
        );
      })}
    </span>
  );
}
