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

// Auth types and API
export interface User {
  id: number;
  email: string;
  name: string | null;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
}

export async function register(
  email: string,
  password: string,
  name?: string
): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name: name || null }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = Array.isArray(err.detail)
      ? err.detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(", ")
      : err.detail;
    throw new Error(msg || "Registration failed");
  }
  return res.json();
}

export async function login(
  email: string,
  password: string
): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = Array.isArray(err.detail)
      ? err.detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(", ")
      : err.detail;
    throw new Error(msg || "Login failed");
  }
  return res.json();
}

export async function getMe(token: string): Promise<User> {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}
