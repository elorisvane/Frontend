"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../lib/auth";
import {
  getProductReviews,
  getMyReview,
  submitReview,
  deleteMyReview,
  type Review,
} from "../data/reviews";

const inputClass =
  "w-full border-b border-neutral-300 bg-transparent py-3 font-sans text-sm tracking-[0.05em] text-neutral-900 placeholder-neutral-400 transition-colors focus:border-neutral-900 focus:outline-none";

function Stars({ value, className = "" }: { value: number; className?: string }) {
  return (
    <span
      className={`tracking-[0.15em] ${className}`}
      aria-label={`${value} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= value ? "text-gold-500" : "text-neutral-300"}>
          ★
        </span>
      ))}
    </span>
  );
}

function RatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex gap-1.5 text-2xl leading-none">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          className={`transition-colors ${
            n <= value ? "text-gold-500" : "text-neutral-300 hover:text-gold-300"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ProductReviews({ slug }: { slug: string }) {
  const { user } = useAuth();
  const pathname = usePathname();

  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [mine, setMine] = useState<Review | null>(null);

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [list, my] = await Promise.all([
        getProductReviews(slug),
        user ? getMyReview(slug) : Promise.resolve(null),
      ]);
      setReviews(list);
      setMine(my);
      if (my) {
        setRating(my.rating);
        setTitle(my.title ?? "");
        setBody(my.body);
      }
    } catch {
      setReviews((prev) => prev ?? []);
    }
  }, [slug, user]);

  useEffect(() => {
    load();
  }, [load]);

  const published = reviews ?? [];
  const count = published.length;
  const average = count
    ? published.reduce((s, r) => s + r.rating, 0) / count
    : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    if (!body.trim()) {
      setError("Please write a few words about the piece.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await submitReview({ slug, rating, title, body });
      setEditing(false);
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not submit your review.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Remove your review?")) return;
    setError(null);
    try {
      await deleteMyReview(slug);
      setMine(null);
      setRating(5);
      setTitle("");
      setBody("");
      setEditing(false);
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not remove your review.",
      );
    }
  }

  return (
    <section className="border-t border-neutral-200 px-6 py-20 md:px-12">
      <div className="mx-auto max-w-[1100px]">
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-serif text-3xl font-light tracking-[0.05em]">
              Reviews
            </h2>
            {count > 0 ? (
              <div className="mt-3 flex items-center gap-3">
                <Stars value={Math.round(average)} className="text-lg" />
                <span className="font-sans text-[13px] tracking-[0.04em] text-neutral-500">
                  {average.toFixed(1)} · {count}{" "}
                  {count === 1 ? "review" : "reviews"}
                </span>
              </div>
            ) : (
              <p className="mt-3 font-sans text-[13px] tracking-[0.04em] text-neutral-400">
                No reviews yet — be the first to share your impressions.
              </p>
            )}
          </div>

          {user && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="shrink-0 border border-neutral-900 px-8 py-3 font-sans text-[11px] tracking-[0.3em] text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white"
            >
              {mine ? "EDIT YOUR REVIEW" : "WRITE A REVIEW"}
            </button>
          )}
          {!user && (
            <Link
              href={`/account?redirect=${encodeURIComponent(pathname)}`}
              className="shrink-0 border border-neutral-900 px-8 py-3 font-sans text-[11px] tracking-[0.3em] text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white"
            >
              SIGN IN TO REVIEW
            </Link>
          )}
        </div>

        {user && editing && (
          <form
            onSubmit={handleSubmit}
            className="mt-10 max-w-xl space-y-6 border border-neutral-200 p-6 sm:p-8"
          >
            <div>
              <span className="block font-sans text-[10px] uppercase tracking-[0.3em] text-neutral-400">
                Your rating
              </span>
              <div className="mt-3">
                <RatingInput value={rating} onChange={setRating} />
              </div>
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className={inputClass}
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Share your impressions of this piece…"
              className={`${inputClass} resize-y`}
            />
            {error && (
              <p className="font-sans text-[12px] tracking-[0.08em] text-red-600">
                {error}
              </p>
            )}
            <div className="flex items-center gap-6">
              <button
                type="submit"
                disabled={saving}
                className="bg-neutral-900 px-10 py-3 font-sans text-[11px] tracking-[0.3em] text-white transition-colors hover:bg-neutral-700 disabled:opacity-50"
              >
                {saving ? "SUBMITTING…" : mine ? "UPDATE REVIEW" : "SUBMIT REVIEW"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setError(null);
                }}
                className="font-sans text-[11px] tracking-[0.3em] text-neutral-400 transition-colors hover:text-neutral-900"
              >
                CANCEL
              </button>
              {mine && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="ml-auto font-sans text-[11px] tracking-[0.2em] text-neutral-400 transition-colors hover:text-red-600"
                >
                  DELETE
                </button>
              )}
            </div>
          </form>
        )}

        {reviews === null ? (
          <p className="mt-12 font-sans text-[11px] tracking-[0.3em] text-neutral-400">
            LOADING…
          </p>
        ) : count > 0 ? (
          <ul className="mt-12 divide-y divide-neutral-200">
            {published.map((r) => (
              <li key={r.id} className="py-8">
                <div className="flex items-center justify-between gap-4">
                  <Stars value={r.rating} />
                  <span className="font-sans text-[11px] tracking-[0.1em] text-neutral-400">
                    {new Date(r.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {r.title && (
                  <p className="mt-3 font-serif text-lg font-light tracking-[0.03em] text-neutral-900">
                    {r.title}
                  </p>
                )}
                <p className="mt-2 font-sans text-[14px] leading-loose tracking-[0.02em] text-neutral-600">
                  {r.body}
                </p>
                <p className="mt-3 font-sans text-[11px] uppercase tracking-[0.2em] text-neutral-400">
                  {r.authorName || "Verified client"}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
