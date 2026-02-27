const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface CoffeeShop {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  description: string | null;
  website: string | null;
  created_at: string;
}

export interface CoffeeShopDetail extends CoffeeShop {
  avg_rating: number | null;
  review_count: number;
}

export async function getShops(): Promise<CoffeeShop[]> {
  const res = await fetch(`${API_BASE}/api/shops`);
  if (!res.ok) throw new Error("Failed to fetch shops");
  return res.json();
}

export async function getShopById(id: number): Promise<CoffeeShopDetail> {
  const res = await fetch(`${API_BASE}/api/shops/${id}`);
  if (!res.ok) throw new Error("Failed to fetch shop");
  return res.json();
}

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error("API unhealthy");
  return res.json();
}
