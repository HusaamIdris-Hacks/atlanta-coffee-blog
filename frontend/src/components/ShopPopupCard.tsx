"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Globe, Heart, MapPin, Star, X } from "lucide-react";
import Stars from "@/components/Stars";
import {
  addFavorite,
  createReview,
  deleteReview,
  getReviewsByShop,
  removeFavorite,
  updateReview,
  type CoffeeShopDetail,
  type Review,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import ConfirmDialog from "./ConfirmDialog";

interface ShopPopupCardProps {
  shop: CoffeeShopDetail;
  onClose: () => void;
  onShopUpdated: () => Promise<void>;
}

export default function ShopPopupCard({
  shop,
  onClose,
  onShopUpdated,
}: ShopPopupCardProps) {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const isLoggedIn = Boolean(user && token);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

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

  const handleFavoriteToggle = async () => {
    if (!user || !token) return;
    setFavoriteBusy(true);
    try {
      if (shop.is_favorited && shop.favorite_id != null) {
        await removeFavorite(shop.favorite_id, token);
        showToast("Removed from favorites", "info");
      } else {
        await addFavorite(shop.id, user.id, token);
        showToast("Saved to favorites", "success");
      }
      await onShopUpdated();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Couldn’t update favorite", "error");
    } finally {
      setFavoriteBusy(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!user || !token) return;
    setReviewSubmitting(true);
    try {
      if (shop.user_review) {
        await updateReview(
          shop.user_review.id,
          reviewRating,
          reviewComment || null,
          token
        );
        showToast("Review updated", "success");
      } else {
        await createReview(shop.id, user.id, reviewRating, reviewComment || null, token);
        showToast("Review posted", "success");
      }
      await onShopUpdated();
      await loadReviews();
      setReviewFormOpen(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Couldn’t save review", "error");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!shop.user_review || !token) return;
    setReviewSubmitting(true);
    try {
      await deleteReview(shop.user_review.id, token);
      showToast("Review deleted", "info");
      setDeleteConfirmOpen(false);
      await onShopUpdated();
      await loadReviews();
      setReviewFormOpen(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Couldn’t delete review", "error");
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <>
      <div className="w-80 max-h-[min(90vh,36rem)] flex flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-amber-200/70 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="relative overflow-hidden bg-linear-to-r from-amber-800 to-amber-700 px-4 py-3.5 flex items-start justify-between shrink-0">
          <div
            aria-hidden
            className="absolute -right-8 -top-10 h-24 w-24 rounded-full bg-white/10 blur-xl"
          />
          <h3 className="relative text-white font-bold text-base leading-tight pr-2">
            {shop.name}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="relative text-white/70 hover:text-white hover:rotate-90 transition-transform duration-300 shrink-0 min-w-11 min-h-11 flex items-center justify-center"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto flex-1 min-h-0">
          {isLoggedIn && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleFavoriteToggle}
                disabled={favoriteBusy}
                className={`rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 ${
                  shop.is_favorited
                    ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                    : "border-amber-200 bg-white text-amber-900 hover:bg-amber-50"
                }`}
                aria-label={shop.is_favorited ? "Remove from favorites" : "Add to favorites"}
              >
                <span className="flex items-center gap-1.5">
                  <Heart
                    size={15}
                    className={shop.is_favorited ? "fill-rose-500 text-rose-500" : ""}
                  />
                  {favoriteBusy ? "…" : shop.is_favorited ? "Favorited" : "Add to favorites"}
                </span>
              </button>
            </div>
          )}

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-600 flex items-start gap-1.5 hover:text-amber-800 hover:underline transition-colors"
            title="Get directions in Google Maps"
          >
            <MapPin size={15} className="mt-0.5 shrink-0 text-amber-600/70" />
            <span>{shop.address}</span>
          </a>

          {shop.avg_rating !== null ? (
            <div className="flex items-center gap-2 text-sm">
              <Stars value={shop.avg_rating} size={15} />
              <span className="text-gray-600">
                {shop.avg_rating.toFixed(1)} ({shop.review_count}{" "}
                {shop.review_count === 1 ? "review" : "reviews"})
              </span>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No reviews yet</p>
          )}

          {shop.description && (
            <p className="text-sm text-gray-700 leading-relaxed">{shop.description}</p>
          )}

          {shop.website && (
            <a
              href={shop.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-800 hover:text-orange-600 transition-colors"
            >
              <Globe size={15} /> Visit Website
            </a>
          )}

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
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
              )}
            </div>
          )}

          <div className="pt-2 border-t border-amber-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-amber-900">Reviews</h4>
              {isLoggedIn ? (
                !reviewFormOpen && (
                  <button
                    type="button"
                    onClick={() => setReviewFormOpen(true)}
                    className="text-xs font-medium text-amber-800 hover:text-amber-600"
                  >
                    {shop.user_review ? "Edit review" : "Write a review"}
                  </button>
                )
              ) : (
                <Link href="/login" className="text-xs font-medium text-amber-800 hover:text-amber-600">
                  Sign in to review
                </Link>
              )}
            </div>

            {reviewFormOpen && isLoggedIn && (
              <div className="mb-3 p-3 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setReviewRating(r)}
                      className="leading-none hover:scale-110 transition-transform"
                      aria-label={`Rate ${r} stars`}
                    >
                      <Star
                        size={24}
                        className={
                          r <= reviewRating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-none text-amber-300"
                        }
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Add a comment (optional)"
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-amber-200 bg-white/90 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
                />
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleReviewSubmit}
                    disabled={reviewSubmitting}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-amber-800 rounded-xl hover:bg-amber-700 disabled:opacity-50"
                  >
                    {reviewSubmitting ? "Saving…" : shop.user_review ? "Update" : "Save"}
                  </button>
                  {shop.user_review && (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmOpen(true)}
                      disabled={reviewSubmitting}
                      className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl disabled:opacity-50"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setReviewFormOpen(false);
                    }}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {reviewsLoading ? (
              <p className="text-sm text-gray-400 italic">Loading reviews…</p>
            ) : reviews.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No reviews yet. Be the first!</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    className="text-sm p-2 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      <Stars value={r.rating} size={13} />
                      <span className="text-gray-500 text-xs">
                        {new Date(r.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    {r.comment && <p className="text-gray-700 mt-1">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete review?"
        message="This removes your review for this shop. You can write a new one later."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteReview}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </>
  );
}
