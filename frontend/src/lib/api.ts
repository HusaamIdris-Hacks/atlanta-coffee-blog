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

// Auth types and API
export interface User {
  id: number;
  email: string;
  name: string | null;
  bio: string | null;
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
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  return `${base}/static/${profilePicture}`;
}

export async function updateProfile(
  token: string,
  data: { name?: string; bio?: string; profile_ring_color?: string | null }
): Promise<User> {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to update profile");
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

export async function changePassword(
  token: string,
  currentPassword: string,
  newPassword: string
): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE}/api/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to change password");
  }
  return res.json();
}

// Favorites API (requires token)
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

// Reviews API (requires token for create/update/delete)
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
  if (!res.ok) throw new Error("Failed to fetch reviews");
  return res.json();
}
