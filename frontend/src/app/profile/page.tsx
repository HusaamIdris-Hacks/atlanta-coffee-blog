"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import ShopCard from "@/components/ShopCard";
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
  const { user, token, loading: authLoading, updateProfile, uploadAvatar, changePassword } = useAuth();
  const [favoriteShops, setFavoriteShops] = useState<CoffeeShopDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Profile form state
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [ringColor, setRingColor] = useState(DEFAULT_RING);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [editDropdownOpen, setEditDropdownOpen] = useState(false);
  const [editMode, setEditMode] = useState<"photo" | "profile" | "ring" | "password" | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [ringColorError, setRingColorError] = useState("");

  // My Reviews dropdown
  const [myReviews, setMyReviews] = useState<ReviewWithShop[]>([]);
  const [reviewsDropdownOpen, setReviewsDropdownOpen] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const loadFavorites = useCallback(async () => {
    if (!token || !user) return;
    setLoading(true);
    setError(null);
    try {
      const favs = await getFavorites(token);
      const myFavs = favs.filter((f: Favorite) => f.user_id === user.id);
      const shopDetails = await Promise.all(
        myFavs.map((f) => getShopById(f.shop_id, token))
      );
      setFavoriteShops(shopDetails);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load favorites");
      setFavoriteShops([]);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  const loadMyReviews = useCallback(async () => {
    if (!token) return;
    setReviewsLoading(true);
    try {
      const reviews = await getMyReviews(token);
      setMyReviews(reviews);
    } catch {
      setMyReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, [token]);

  const startEditReview = useCallback((r: ReviewWithShop) => {
    setEditingReviewId(r.id);
    setEditRating(r.rating);
    setEditComment(r.comment || "");
    setEditError("");
  }, []);

  const cancelEditReview = useCallback(() => {
    setEditingReviewId(null);
    setEditError("");
  }, []);

  const handleUpdateReview = useCallback(
    async (reviewId: number) => {
      if (!token) return;
      setEditSubmitting(true);
      setEditError("");
      try {
        await updateReview(reviewId, editRating, editComment || null, token);
        await Promise.all([loadMyReviews(), loadFavorites()]);
        setEditingReviewId(null);
      } catch (err) {
        setEditError(err instanceof Error ? err.message : "Failed to update review");
      } finally {
        setEditSubmitting(false);
      }
    },
    [token, editRating, editComment, loadMyReviews, loadFavorites]
  );

  const handleDeleteReview = useCallback(
    async (reviewId: number) => {
      if (!token) return;
      setEditSubmitting(true);
      setEditError("");
      try {
        await deleteReview(reviewId, token);
        await Promise.all([loadMyReviews(), loadFavorites()]);
        setEditingReviewId(null);
      } catch (err) {
        setEditError(err instanceof Error ? err.message : "Failed to delete review");
      } finally {
        setEditSubmitting(false);
      }
    },
    [token, loadMyReviews, loadFavorites]
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }
    if (user && token) {
      loadFavorites();
      loadMyReviews();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, user, token, router, loadFavorites, loadMyReviews]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setRingColor(user.profile_ring_color || DEFAULT_RING);
    }
  }, [user]);

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

  // Load reviews when dropdown is opened
  useEffect(() => {
    if (reviewsDropdownOpen && token) {
      loadMyReviews();
    }
  }, [reviewsDropdownOpen, token, loadMyReviews]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError("");
    try {
      await updateProfile({
        name: name || undefined,
        bio: bio || undefined,
        profile_ring_color: ringColor,
      });
      setEditMode(null);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    setAvatarError("");
    try {
      await uploadAvatar(file);
      setEditMode(null);
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Failed to upload");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  const handleRingColorChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setRingColor(color);
    try {
      await updateProfile({ profile_ring_color: color });
    } catch (err) {
      setRingColorError(err instanceof Error ? err.message : "Failed to change ring color");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    setPasswordSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setEditMode(null);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setPasswordSaving(false);
    }
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </main>
      </div>
    );
  }

  const avgRating =
    myReviews.length > 0
      ? myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length
      : null;
  const reviewsLeft = myReviews.length;

  const avatarUrl = getAvatarUrl(user?.profile_picture ?? null);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full">
        {/* Profile header: avatar + name only */}
        <div className="rounded-xl bg-white border border-amber-200 p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-full overflow-hidden bg-amber-100 border-2 shrink-0"
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
                  <span className="flex items-center justify-center w-full h-full text-2xl text-amber-600 rounded-full bg-amber-100">
                    👤
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-amber-900">
                  {user?.name || user?.email}
                </h1>
                {user?.bio && (
                  <p className="text-sm text-gray-600 mt-1 max-w-md">{user.bio}</p>
                )}
              </div>
            </div>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setEditDropdownOpen((o) => !o)}
                className="px-4 py-2 rounded-lg border border-amber-800 text-amber-800 font-medium hover:bg-amber-50 transition-colors"
              >
                Edit profile
              </button>
              {editDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-amber-200 bg-white shadow-lg py-1 z-10">
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
                      setEditMode("profile");
                      setEditDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-amber-900 hover:bg-amber-50"
                  >
                    Edit name & bio
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode("ring");
                      setEditDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-amber-900 hover:bg-amber-50"
                  >
                    Ring color
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode("password");
                      setEditDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-amber-900 hover:bg-amber-50"
                  >
                    Change password
                  </button>
                </div>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.gif,.webp"
            onChange={handleAvatarChange}
            className="hidden"
          />
          {avatarUploading && (
            <p className="text-sm text-amber-700 mt-2">Uploading photo...</p>
          )}
          {avatarError && (
            <p className="text-sm text-red-600 mt-2">{avatarError}</p>
          )}

          {/* Edit forms (shown when option selected from dropdown) */}
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
                        setEditMode(null);
                      } catch {
                        // Error handled by AuthContext / could add toast
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
                  className="w-10 h-10 rounded cursor-pointer border border-amber-200"
                />
                <button
                  type="button"
                  onClick={async () => {
                    const colorToSave =
                      colorInputRef.current?.value ?? ringColor;
                    try {
                      await updateProfile({ profile_ring_color: colorToSave });
                      setEditMode(null);
                    } catch {
                      // Error handled by AuthContext
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-800 text-white text-sm font-medium hover:bg-amber-700"
                >
                  Apply
                </button>
              </div>
              <button
                type="button"
                onClick={() => setEditMode(null)}
                className="mt-4 px-4 py-2 rounded-lg border border-amber-200 text-amber-900 hover:bg-amber-50 text-sm"
              >
                Done
              </button>
            </div>
          )}
          {editMode === "profile" && (
            <form onSubmit={handleProfileSubmit} className="mt-6 pt-6 border-t border-amber-100 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-amber-900 mb-1">
                  Display name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-amber-900 mb-1">
                  Bio (optional)
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
              {profileError && (
                <p className="text-sm text-red-600">{profileError}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-4 py-2 rounded-lg bg-amber-800 text-white font-medium hover:bg-amber-700 disabled:opacity-50"
                >
                  {profileSaving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode(null)}
                  className="px-4 py-2 rounded-lg border border-amber-200 text-amber-900 hover:bg-amber-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {editMode === "password" && (
            <form onSubmit={handlePasswordSubmit} className="mt-6 pt-6 border-t border-amber-100 space-y-4 max-w-sm">
              <div>
                <label htmlFor="current" className="block text-sm font-medium text-amber-900 mb-1">
                  Current password
                </label>
                <input
                  id="current"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>
              <div>
                <label htmlFor="new" className="block text-sm font-medium text-amber-900 mb-1">
                  New password
                </label>
                <input
                  id="new"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>
              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-amber-900 mb-1">
                  Confirm new password
                </label>
                <input
                  id="confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>
              {passwordError && (
                <p className="text-sm text-red-600">{passwordError}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="px-4 py-2 rounded-lg bg-amber-800 text-white font-medium hover:bg-amber-700 disabled:opacity-50"
                >
                  {passwordSaving ? "Updating..." : "Update password"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(null);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setPasswordError("");
                  }}
                  className="px-4 py-2 rounded-lg border border-amber-200 text-amber-900 hover:bg-amber-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl bg-white border border-amber-200 p-4 shadow-sm">
            <p className="text-2xl font-bold text-amber-900">
              {favoriteShops.length}
            </p>
            <p className="text-sm text-gray-600">Favorites</p>
          </div>
          <div className="rounded-xl bg-white border border-amber-200 p-4 shadow-sm">
            <p className="text-2xl font-bold text-amber-900">
              {avgRating !== null ? avgRating.toFixed(1) : "—"}
            </p>
            <p className="text-sm text-gray-600">
              Avg rating (your reviews)
            </p>
          </div>
          <div className="rounded-xl bg-white border border-amber-200 p-4 shadow-sm">
            <p className="text-2xl font-bold text-amber-900">{reviewsLeft}</p>
            <p className="text-sm text-gray-600">Reviews left</p>
          </div>
        </div>

        {/* My Reviews dropdown */}
        <div className="rounded-xl bg-white border border-amber-200 shadow-sm mb-8 overflow-hidden">
          <button
            type="button"
            onClick={() => {
              setReviewsDropdownOpen((o) => !o);
              if (reviewsDropdownOpen) setEditingReviewId(null);
            }}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-amber-50 transition-colors"
          >
            <h2 className="text-lg font-semibold text-amber-900">My Reviews</h2>
            <span
              className={`text-amber-600 transition-transform ${
                reviewsDropdownOpen ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
          </button>
          {reviewsDropdownOpen && (
            <div className="border-t border-amber-100 px-6 py-4">
              {reviewsLoading ? (
                <p className="text-gray-500 text-sm">Loading reviews...</p>
              ) : myReviews.length === 0 ? (
                <p className="text-gray-500 text-sm">You haven&apos;t left any reviews yet.</p>
              ) : (
                <ul className="space-y-4">
                  {myReviews.map((r) => (
                    <li
                      key={r.id}
                      className="pb-4 border-b border-amber-100 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/map?shop=${r.shop_id}&lat=${r.shop_lat}&lng=${r.shop_lng}`}
                            className="font-medium text-amber-900 hover:text-amber-700 hover:underline"
                          >
                            {r.shop_name}
                          </Link>
                          <p className="text-sm text-gray-600 mt-0.5">{r.shop_address}</p>
                        </div>
                        {editingReviewId !== r.id && (
                          <div className="shrink-0 flex gap-1">
                            <button
                              type="button"
                              onClick={() => startEditReview(r)}
                              className="px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100 rounded-lg transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteReview(r.id)}
                              disabled={editSubmitting}
                              className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                      {editingReviewId === r.id ? (
                        <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setEditRating(star)}
                                className="text-2xl leading-none hover:scale-110 transition-transform"
                                aria-label={`Rate ${star} stars`}
                              >
                                {star <= editRating ? "★" : "☆"}
                              </button>
                            ))}
                          </div>
                          <textarea
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            placeholder="Add a comment (optional)"
                            rows={2}
                            className="w-full px-3 py-2 text-sm rounded border border-amber-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
                          />
                          {editError && (
                            <p className="text-xs text-red-600">{editError}</p>
                          )}
                          <div className="flex gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleUpdateReview(r.id)}
                              disabled={editSubmitting}
                              className="px-3 py-1.5 text-sm font-medium text-white bg-amber-800 rounded hover:bg-amber-700 disabled:opacity-50"
                            >
                              {editSubmitting ? "Saving..." : "Update"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteReview(r.id)}
                              disabled={editSubmitting}
                              className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded disabled:opacity-50"
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditReview}
                              disabled={editSubmitting}
                              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-amber-600 font-medium">
                              {Array.from({ length: 5 }, (_, i) =>
                                i < r.rating ? "★" : "☆"
                              ).join("")}{" "}
                              {r.rating}/5
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(r.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                          {r.comment && (
                            <p className="text-sm text-gray-700 mt-2 italic">&ldquo;{r.comment}&rdquo;</p>
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

        {/* Favorited shops */}
        <div>
          <h2 className="text-lg font-semibold text-amber-900 mb-4">
            Your Favorites
          </h2>
          {loading ? (
            <p className="text-gray-500">Loading favorites...</p>
          ) : error ? (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-red-700">{error}</p>
              <button
                onClick={loadFavorites}
                className="mt-2 text-sm font-medium text-red-800 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : favoriteShops.length === 0 ? (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-8 text-center">
              <p className="text-amber-900 font-medium">No favorites yet</p>
              <p className="text-gray-600 text-sm mt-1">
                Explore the map and add shops you love
              </p>
              <Link
                href="/map"
                className="inline-block mt-4 px-4 py-2 rounded-lg bg-amber-800 text-white font-medium hover:bg-amber-700"
              >
                Explore Map
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteShops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
