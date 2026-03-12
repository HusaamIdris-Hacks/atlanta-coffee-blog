"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { CoffeeShopDetail, Review } from "@/lib/api";
import {
  addFavorite,
  removeFavorite,
  getReviewsByShop,
  createReview,
  updateReview,
  deleteReview,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface ShopPopupCardProps {
  shop: CoffeeShopDetail;
  onClose: () => void;
  onRefresh: () => Promise<void>;
}

export default function ShopPopupCard({
  shop,
  onClose,
  onRefresh,
}: ShopPopupCardProps) {
  const { user, token } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const loadReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const data = await getReviewsByShop(shop.id);
      setReviews(data);
    } catch {
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, [shop.id]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    if (shop.user_review) {
      setReviewRating(shop.user_review.rating);
      setReviewComment(shop.user_review.comment || "");
    } else {
      setReviewRating(5);
      setReviewComment("");
    }
  }, [shop.user_review]);

  const handleFavoriteClick = useCallback(async () => {
    if (!user || !token) return;
    setFavoriteLoading(true);
    try {
      if (shop.is_favorited && shop.favorite_id) {
        await removeFavorite(shop.favorite_id, token);
      } else {
        await addFavorite(shop.id, user.id, token);
      }
      await onRefresh();
    } catch (err) {
      console.error("Favorite toggle failed:", err);
    } finally {
      setFavoriteLoading(false);
    }
  }, [user, token, shop.is_favorited, shop.favorite_id, shop.id, onRefresh]);

  const handleReviewSubmit = useCallback(async () => {
    if (!user || !token) return;
    setReviewSubmitting(true);
    setReviewError("");
    try {
      if (shop.user_review) {
        await updateReview(
          shop.user_review.id,
          reviewRating,
          reviewComment || null,
          token
        );
      } else {
        await createReview(
          shop.id,
          user.id,
          reviewRating,
          reviewComment || null,
          token
        );
      }
      await onRefresh();
      await loadReviews();
      setReviewFormOpen(false);
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "Failed to save review");
    } finally {
      setReviewSubmitting(false);
    }
  }, [
    user,
    token,
    shop.id,
    shop.user_review,
    reviewRating,
    reviewComment,
    onRefresh,
    loadReviews,
  ]);

  const handleDeleteReview = useCallback(async () => {
    if (!shop.user_review || !token) return;
    setReviewSubmitting(true);
    setReviewError("");
    try {
      await deleteReview(shop.user_review.id, token);
      await onRefresh();
      await loadReviews();
      setReviewFormOpen(false);
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "Failed to delete review");
    } finally {
      setReviewSubmitting(false);
    }
  }, [shop.user_review, token, onRefresh, loadReviews]);

  const isLoggedIn = !!user && !!token;

  return (
    <div className="w-72 rounded-xl bg-white shadow-xl border border-amber-200 overflow-hidden max-h-[85vh] flex flex-col">
      {/* Header */}
      <div className="bg-linear-to-r from-amber-800 to-amber-700 px-4 py-3 flex items-start justify-between shrink-0">
        <h3 className="text-white font-bold text-base leading-tight pr-2">
          {shop.name}
        </h3>
        <div className="flex items-center gap-2 shrink-0">
          {isLoggedIn && (
            <button
              onClick={handleFavoriteClick}
              disabled={favoriteLoading}
              aria-label={shop.is_favorited ? "Remove from favorites" : "Add to favorites"}
              className="text-white/80 hover:text-red-300 transition-colors disabled:opacity-50"
            >
              {shop.is_favorited ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
            </button>
          )}
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-lg leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3 overflow-y-auto flex-1">
        {/* Address */}
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-600 flex items-start gap-1.5 hover:text-amber-800 hover:underline transition-colors"
          title="Get directions in Google Maps"
        >
          <span className="shrink-0">📍</span>
          <span>{shop.address}</span>
        </a>

        {/* Rating */}
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

        {/* Description */}
        {shop.description && (
          <p className="text-sm text-gray-700 leading-relaxed">
            {shop.description}
          </p>
        )}

        {/* Website link */}
        {shop.website && (
          <a
            href={shop.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-800 hover:text-orange-600 transition-colors"
          >
            🌐 Visit Website
          </a>
        )}

        {/* Social links */}
        {(shop.instagram || shop.twitter || shop.facebook) && (
          <div className="flex items-center gap-4 pt-1">
            {shop.instagram && (
              <a
                href={shop.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Instagram"
                className="text-pink-500 hover:text-pink-600 transition-colors"
                title="Instagram"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.467.398.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            )}
            {shop.twitter && (
              <a
                href={shop.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit X (Twitter)"
                className="text-gray-700 hover:text-black transition-colors"
                title="X"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            )}
            {shop.facebook && (
              <a
                href={shop.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Facebook"
                className="text-blue-600 hover:text-blue-700 transition-colors"
                title="Facebook"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
            )}
          </div>
        )}

        {/* Reviews section */}
        <div className="pt-2 border-t border-amber-100">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-amber-900">Reviews</h4>
            {isLoggedIn ? (
              !reviewFormOpen && (
                <button
                  onClick={() => setReviewFormOpen(true)}
                  className="text-xs font-medium text-amber-800 hover:text-amber-600"
                >
                  {shop.user_review ? "Edit review" : "Write a review"}
                </button>
              )
            ) : (
              <Link
                href="/login"
                className="text-xs font-medium text-amber-800 hover:text-amber-600"
              >
                Sign in to review
              </Link>
            )}
          </div>

          {reviewFormOpen && isLoggedIn && (
            <div className="mb-3 p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReviewRating(r)}
                    className="text-2xl leading-none hover:scale-110 transition-transform"
                    aria-label={`Rate ${r} stars`}
                  >
                    {r <= reviewRating ? "★" : "☆"}
                  </button>
                ))}
              </div>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Add a comment (optional)"
                rows={2}
                className="w-full px-3 py-2 text-sm rounded border border-amber-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
              />
              {reviewError && (
                <p className="text-xs text-red-600">{reviewError}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleReviewSubmit}
                  disabled={reviewSubmitting}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-amber-800 rounded hover:bg-amber-700 disabled:opacity-50"
                >
                  {reviewSubmitting ? "Saving..." : shop.user_review ? "Update" : "Save"}
                </button>
                {shop.user_review && (
                  <button
                    onClick={handleDeleteReview}
                    disabled={reviewSubmitting}
                    className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={() => {
                    setReviewFormOpen(false);
                    setReviewError("");
                  }}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {reviewsLoading ? (
            <p className="text-sm text-gray-400 italic">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No reviews yet. Be the first!</p>
          ) : (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="text-sm p-2 rounded bg-gray-50 border border-gray-100"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500">
                      {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {new Date(r.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  {r.comment && (
                    <p className="text-gray-700 mt-1 text-xs">{r.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
