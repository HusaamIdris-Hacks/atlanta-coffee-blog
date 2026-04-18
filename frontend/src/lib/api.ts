/**
 * Public API origin from env. Local dev values (localhost / 127.0.0.1) are forced to
 * same-origin relative paths so Next.js rewrites proxy to FastAPI — the browser must
 * not call :8000 directly (CORS / IPv4 vs IPv6 issues), even if NEXT_PUBLIC_API_URL is set.
 */
const RAW = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

function isLocalBackendUrl(url: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(url);
}

/** Empty string = same-origin `/api` + Next rewrites. Non-local env = full origin for production. */
const API_BASE = RAW !== "" && isLocalBackendUrl(RAW) ? "" : RAW;

export interface CoffeeShop {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  description: string | null;
  website: string | null;
  instagram: string | null;
  twitter: string | null;
  facebook: string | null;
  created_at: string;
}

export interface UserReviewInShop {
  id: number;
  rating: number;
  comment: string | null;
  updated_at: string;
}

export interface CoffeeShopDetail extends CoffeeShop {
  avg_rating: number | null;
  review_count: number;
  is_favorited: boolean | null;
  favorite_id: number | null;
  user_review: UserReviewInShop | null;
}

export async function getShops(): Promise<CoffeeShop[]> {
  const res = await fetch(`${API_BASE}/api/shops`);
  if (!res.ok) throw new Error("Failed to fetch shops");
  return res.json();
}

export async function getShopsInBounds(bounds: {
  min_lat: number;
  max_lat: number;
  min_lng: number;
  max_lng: number;
}): Promise<CoffeeShop[]> {
  const q = new URLSearchParams({
    min_lat: String(bounds.min_lat),
    max_lat: String(bounds.max_lat),
    min_lng: String(bounds.min_lng),
    max_lng: String(bounds.max_lng),
  });
  const res = await fetch(`${API_BASE}/api/shops?${q}`);
  if (!res.ok) throw new Error("Failed to fetch shops in area");
  return res.json();
}

/** Nearest N shops to a point (map preload). */
export const MAP_PRELOAD_SHOP_COUNT = 50;

export async function getShopsNearest(
  lat: number,
  lng: number,
  limit: number = MAP_PRELOAD_SHOP_COUNT
): Promise<CoffeeShop[]> {
  const q = new URLSearchParams({
    near_lat: String(lat),
    near_lng: String(lng),
    limit: String(limit),
  });
  const res = await fetch(`${API_BASE}/api/shops?${q}`);
  if (!res.ok) throw new Error("Failed to fetch nearby shops");
  return res.json();
}

export async function refreshShopArea(
  lat: number,
  lng: number,
  radiusM = 30_000
): Promise<{ merged_count: number; fetched_count: number }> {
  const res = await fetch(`${API_BASE}/api/shops/refresh-area`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lat, lng, radius_m: radiusM }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to refresh area");
  }
  return res.json();
}

export interface FavoriteCity {
  id: number;
  label: string;
  lat: number;
  lng: number;
  created_at: string;
}

export async function getFavoriteCities(token: string): Promise<FavoriteCity[]> {
  const res = await fetch(`${API_BASE}/api/favorite-cities`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to load saved cities");
  return res.json();
}

export async function addFavoriteCity(
  token: string,
  body: { label: string; lat: number; lng: number }
): Promise<FavoriteCity> {
  const res = await fetch(`${API_BASE}/api/favorite-cities`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Could not save city");
  }
  return res.json();
}

export async function deleteFavoriteCity(
  token: string,
  cityId: number
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/favorite-cities/${cityId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Could not remove city");
  }
}

export async function getShopById(
  id: number,
  token?: string | null
): Promise<CoffeeShopDetail> {
  const headers: HeadersInit = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}/api/shops/${id}`, { headers });
  if (!res.ok) throw new Error("Failed to fetch shop");
  return res.json();
}

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error("API unhealthy");
  return res.json();
}

// Auth
export interface User {
  id: number;
  email: string;
  name: string | null;
  profile_picture: string | null;
  profile_ring_color: string | null;
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

export function getAvatarUrl(profilePicture: string | null): string | null {
  if (!profilePicture) return null;
  if (RAW !== "" && isLocalBackendUrl(RAW)) {
    return `/static/${profilePicture}`;
  }
  if (RAW) return `${RAW}/static/${profilePicture}`;
  return `/static/${profilePicture}`;
}

function mapFetchError(e: unknown, fallback: string): Error {
  if (e instanceof TypeError && e.message === "Failed to fetch") {
    const hint =
      API_BASE === ""
        ? "Check that `npm run dev` is running, uvicorn is on port 8000, and BACKEND_URL in next.config matches your API (default http://127.0.0.1:8000)."
        : `Check that the API is reachable at ${API_BASE} (CORS and network).`;
    return new Error(`${fallback} ${hint}`);
  }
  return e instanceof Error ? e : new Error(fallback);
}

export async function updateProfile(
  token: string,
  data: { name?: string; bio?: string; profile_ring_color?: string | null }
): Promise<User> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/auth/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  } catch (e) {
    throw mapFetchError(e, "Could not update profile.");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = Array.isArray(err.detail)
      ? err.detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(", ")
      : err.detail;
    throw new Error(msg || "Failed to update profile");
  }
  return res.json();
}

export async function uploadAvatar(token: string, file: File): Promise<User> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/api/auth/me/avatar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to upload avatar");
  }
  return res.json();
}

// Favorites
export interface Favorite {
  id: number;
  user_id: number;
  shop_id: number;
  created_at: string;
}

export async function getFavorites(token: string): Promise<Favorite[]> {
  const res = await fetch(`${API_BASE}/api/favorites`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch favorites");
  return res.json();
}

export async function addFavorite(
  shopId: number,
  userId: number,
  token: string
): Promise<Favorite> {
  const res = await fetch(`${API_BASE}/api/favorites`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ user_id: userId, shop_id: shopId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to add favorite");
  }
  return res.json();
}

export async function removeFavorite(favoriteId: number, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/favorites/${favoriteId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to remove favorite");
}

// Reviews
export interface Review {
  id: number;
  user_id: number;
  shop_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export async function getReviewsByShop(shopId: number): Promise<Review[]> {
  const res = await fetch(`${API_BASE}/api/reviews?shop_id=${shopId}`);
  if (!res.ok) throw new Error("Failed to fetch reviews");
  return res.json();
}

export async function createReview(
  shopId: number,
  userId: number,
  rating: number,
  comment: string | null,
  token: string
): Promise<Review> {
  const res = await fetch(`${API_BASE}/api/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      user_id: userId,
      shop_id: shopId,
      rating,
      comment: comment || null,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = Array.isArray(err.detail)
      ? err.detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(", ")
      : err.detail;
    throw new Error(msg || "Failed to create review");
  }
  return res.json();
}

export async function updateReview(
  reviewId: number,
  rating: number,
  comment: string | null,
  token: string
): Promise<Review> {
  const res = await fetch(`${API_BASE}/api/reviews/${reviewId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rating, comment: comment || null }),
  });
  if (!res.ok) throw new Error("Failed to update review");
  return res.json();
}

export async function deleteReview(reviewId: number, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/reviews/${reviewId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete review");
}

export interface ReviewWithShop {
  id: number;
  shop_id: number;
  shop_name: string;
  shop_address: string;
  shop_lat: number;
  shop_lng: number;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export async function getMyReviews(token: string): Promise<ReviewWithShop[]> {
  const res = await fetch(`${API_BASE}/api/auth/me/reviews`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch your reviews");
  return res.json();
}
