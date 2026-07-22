"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Star, User } from "lucide-react";
import NavBar from "@/components/NavBar";
import ShopCard from "@/components/ShopCard";
import Stars from "@/components/Stars";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  deleteReview,
  getAvatarUrl,
  getFavorites,
  getMyReviews,
  getShopById,
  updateReview,
  type CoffeeShopDetail,
  type Favorite,
  type ReviewWithShop,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

const RING_COLORS = [
  { value: "#D97706", label: "Amber" },
  { value: "#DC2626", label: "Red" },
  { value: "#2563EB", label: "Blue" },
  { value: "#059669", label: "Green" },
  { value: "#7C3AED", label: "Purple" },
  { value: "#DB2777", label: "Pink" },
] as const;
const DEFAULT_RING = "#D97706";

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, loading: authLoading, updateProfile, uploadAvatar } = useAuth();
  const { showToast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const [favoriteShops, setFavoriteShops] = useState<CoffeeShopDetail[]>([]);
  const [myReviews, setMyReviews] = useState<ReviewWithShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editDropdownOpen, setEditDropdownOpen] = useState(false);
  const [editMode, setEditMode] = useState<"photo" | "profile" | "ring" | "password" | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [ringColor, setRingColor] = useState(DEFAULT_RING);

  const [avatarUploading, setAvatarUploading] = useState(false);

  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deleteReviewId, setDeleteReviewId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    if (!token || !user) return;
    setLoading(true);
    setError(null);
    try {
      const [favs, reviews] = await Promise.all([
        getFavorites(token),
        getMyReviews(token),
      ]);
      const mine = favs.filter((f: Favorite) => f.user_id === user.id);
      const shops = await Promise.all(
        mine.map((f) => getShopById(f.shop_id, token))
      );
      setFavoriteShops(shops);
      setMyReviews(reviews);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
      setFavoriteShops([]);
      setMyReviews([]);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }
    if (user && token) loadData();
    else if (!authLoading) setLoading(false);
  }, [authLoading, user, token, router, loadData]);

  const avgRating =
    myReviews.length > 0
      ? myReviews.reduce((s, r) => s + r.rating, 0) / myReviews.length
      : null;

  const startEdit = (r: ReviewWithShop) => {
    setEditingReviewId(r.id);
    setEditRating(r.rating);
    setEditComment(r.comment || "");
  };

  const handleUpdateReview = async (reviewId: number) => {
    if (!token) return;
    setEditSubmitting(true);
    try {
      await updateReview(reviewId, editRating, editComment || null, token);
      showToast("Review updated", "success");
      setEditingReviewId(null);
      await loadData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Update failed", "error");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (deleteReviewId == null || !token) return;
    setEditSubmitting(true);
    try {
      await deleteReview(deleteReviewId, token);
      showToast("Review deleted", "info");
      setDeleteReviewId(null);
      setEditingReviewId(null);
      await loadData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Delete failed", "error");
    } finally {
      setEditSubmitting(false);
    }
  };

  const avatarUrl = getAvatarUrl(user?.profile_picture ?? null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      await uploadAvatar(file);
      showToast("Profile picture updated", "success");
      setEditMode(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to upload", "error");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setEditDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full">
        <div className="surface-card p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-full overflow-hidden bg-amber-100 border-2 shrink-0 flex items-center justify-center text-3xl shadow-sm"
                style={{
                  borderColor:
                    editMode === "ring" ? ringColor : (user?.profile_ring_color || DEFAULT_RING),
                }}
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={32} className="text-amber-600" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-amber-900">
                  {user?.name || user?.email}
                </h1>
                <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
              </div>
            </div>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setEditDropdownOpen((o) => !o)}
                className="btn-secondary rounded-xl px-4 py-2"
              >
                Edit profile
              </button>
              {editDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-amber-200 bg-white/95 shadow-xl py-1 z-10 backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode("photo");
                      setEditDropdownOpen(false);
                      fileInputRef.current?.click();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-amber-900 hover:bg-amber-50"
                  >
                    Change photo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode("ring");
                      setEditDropdownOpen(false);
                      setRingColor(user?.profile_ring_color || DEFAULT_RING);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-amber-900 hover:bg-amber-50"
                  >
                    Ring color
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.gif,.webp,.heic,.heif,image/heic,image/heif"
            onChange={handleAvatarChange}
            className="hidden"
          />
          {avatarUploading && (
            <p className="text-sm text-amber-700 mt-2">Uploading photo...</p>
          )}

          {editMode === "ring" && (
            <div className="mt-6 pt-6 border-t border-amber-100">
              <p className="text-sm font-medium text-amber-900 mb-3">Profile picture ring color</p>
              <div className="flex flex-wrap gap-4">
                {RING_COLORS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={async () => {
                      setRingColor(value);
                      try {
                        await updateProfile({ profile_ring_color: value });
                        showToast("Ring color updated", "success");
                        setEditMode(null);
                      } catch (err) {
                        showToast(err instanceof Error ? err.message : "Failed to update", "error");
                      }
                    }}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all hover:bg-amber-50 ${
                      ringColor === value ? "bg-amber-50 ring-2 ring-amber-600 ring-offset-2" : ""
                    }`}
                  >
                    <div
                      className="w-12 h-12 rounded-full border-2 transition-transform hover:scale-110"
                      style={{ backgroundColor: value, borderColor: value }}
                    />
                    <span className="text-xs font-medium text-amber-900">{label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3">
                <label className="text-sm text-amber-900">Custom:</label>
                <input
                  ref={colorInputRef}
                  type="color"
                  value={ringColor}
                  onChange={(e) => setRingColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-amber-200"
                />
                <button
                  type="button"
                  onClick={async () => {
                    const colorToSave = colorInputRef.current?.value ?? ringColor;
                    try {
                      await updateProfile({ profile_ring_color: colorToSave });
                      showToast("Ring color updated", "success");
                      setEditMode(null);
                    } catch (err) {
                      showToast(err instanceof Error ? err.message : "Failed to update", "error");
                    }
                  }}
                  className="btn-primary rounded-xl px-4 py-1.5 text-sm"
                >
                  Apply
                </button>
              </div>
              <button
                type="button"
                onClick={() => setEditMode(null)}
                className="mt-4 btn-secondary rounded-xl px-4 py-2 text-sm"
              >
                Done
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="surface-card-subtle p-4">
            <p className="text-2xl font-bold text-amber-900">{favoriteShops.length}</p>
            <p className="text-sm text-gray-600">Favorites</p>
          </div>
          <div className="surface-card-subtle p-4">
            <p className="text-2xl font-bold text-amber-900">
              {avgRating !== null ? avgRating.toFixed(1) : "—"}
            </p>
            <p className="text-sm text-gray-600">Avg rating (your reviews)</p>
          </div>
          <div className="surface-card-subtle p-4">
            <p className="text-2xl font-bold text-amber-900">{myReviews.length}</p>
            <p className="text-sm text-gray-600">Reviews</p>
          </div>
        </div>

        <div className="surface-card mb-8 overflow-hidden">
          <button
            type="button"
            onClick={() => setReviewsOpen((o) => !o)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-amber-50 transition-colors"
          >
            <h2 className="text-lg font-semibold text-amber-900">My reviews</h2>
            <ChevronDown
              size={20}
              className={`text-amber-600 transition-transform ${reviewsOpen ? "rotate-180" : ""}`}
            />
          </button>
          {reviewsOpen && (
            <div className="border-t border-amber-100 px-6 py-4">
              {loading ? (
                <p className="text-gray-500 text-sm">Loading…</p>
              ) : myReviews.length === 0 ? (
                <p className="text-gray-500 text-sm">You haven&apos;t reviewed any shops yet.</p>
              ) : (
                <ul className="space-y-4">
                  {myReviews.map((r) => (
                    <li
                      key={r.id}
                      className="pb-4 border-b border-amber-100 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            href={`/map?shop=${r.shop_id}&lat=${r.shop_lat}&lng=${r.shop_lng}`}
                            className="font-medium text-amber-900 hover:underline"
                          >
                            {r.shop_name}
                          </Link>
                          <p className="text-sm text-gray-600">{r.shop_address}</p>
                        </div>
                        {editingReviewId !== r.id && (
                          <div className="flex gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => startEdit(r)}
                              className="px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100 rounded-lg"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteReviewId(r.id)}
                              disabled={editSubmitting}
                              className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                      {editingReviewId === r.id ? (
                        <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setEditRating(star)}
                                className="leading-none hover:scale-110 transition-transform"
                                aria-label={`${star} stars`}
                              >
                                <Star
                                  size={24}
                                  className={
                                    star <= editRating
                                      ? "fill-amber-400 text-amber-400"
                                      : "fill-none text-amber-300"
                                  }
                                />
                              </button>
                            ))}
                          </div>
                          <textarea
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            rows={2}
                            className="input-field text-sm py-2"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateReview(r.id)}
                              disabled={editSubmitting}
                              className="btn-primary rounded-xl px-3 py-1.5 text-sm disabled:opacity-50"
                            >
                              {editSubmitting ? "Saving…" : "Update"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingReviewId(null)}
                              disabled={editSubmitting}
                              className="px-3 py-1.5 text-sm text-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="flex items-center gap-1.5 text-gray-500 text-sm mt-2">
                            <Stars value={r.rating} size={14} />
                            {r.rating}/5 ·{" "}
                            {new Date(r.updated_at).toLocaleDateString()}
                          </p>
                          {r.comment && (
                            <p className="text-sm text-gray-700 mt-1 italic">&ldquo;{r.comment}&rdquo;</p>
                          )}
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-amber-900 mb-4">Your favorites</h2>
          {loading ? (
            <p className="text-gray-500">Loading favorites…</p>
          ) : error ? (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-red-700">{error}</p>
              <button
                type="button"
                onClick={loadData}
                className="mt-2 text-sm font-medium text-red-800 underline"
              >
                Try again
              </button>
            </div>
          ) : favoriteShops.length === 0 ? (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-8 text-center">
              <p className="text-amber-900 font-medium">No favorites yet</p>
              <Link
                href="/map"
                className="inline-block mt-4 btn-primary rounded-xl px-4 py-2"
              >
                Explore map
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {favoriteShops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          )}
        </div>
      </main>

      <ConfirmDialog
        open={deleteReviewId !== null}
        title="Delete this review?"
        message="Your review will be removed from this shop."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteReview}
        onCancel={() => setDeleteReviewId(null)}
      />
    </div>
  );
}
