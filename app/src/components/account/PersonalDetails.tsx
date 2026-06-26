"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth";
import { getProfile, upsertProfile } from "../../data/profile";

const inputClass =
  "w-full border-b border-neutral-300 bg-transparent py-3 font-sans text-sm tracking-[0.05em] text-neutral-900 placeholder-neutral-400 transition-colors focus:border-neutral-900 focus:outline-none";
const labelClass =
  "block font-sans text-[10px] uppercase tracking-[0.3em] text-neutral-400";

const TITLES = ["", "Mr", "Mrs", "Ms", "Mx", "Dr"];

export default function PersonalDetails() {
  const { user, updateDisplayName } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [title, setTitle] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    let active = true;
    getProfile()
      .then((p) => {
        if (!active) return;
        // Seed name from auth metadata when no profile row exists yet.
        const meta = user?.user_metadata as
          | { first_name?: string; last_name?: string }
          | undefined;
        setTitle(p?.title ?? "");
        setFirstName(p?.firstName ?? meta?.first_name ?? "");
        setLastName(p?.lastName ?? meta?.last_name ?? "");
        setPhone(p?.phone ?? "");
        setDob(p?.dateOfBirth ?? "");
        setMarketing(p?.marketingOptIn ?? false);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Could not load details.");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      await upsertProfile({
        title,
        firstName,
        lastName,
        phone,
        dateOfBirth: dob,
        marketingOptIn: marketing,
      });
      await updateDisplayName(firstName, lastName);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your details.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="mt-8 font-sans text-[11px] tracking-[0.3em] text-neutral-400">
        LOADING…
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-8">
      <div className="grid grid-cols-1 gap-7 sm:grid-cols-3">
        <label className="space-y-2">
          <span className={labelClass}>Title</span>
          <select
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          >
            {TITLES.map((t) => (
              <option key={t} value={t}>
                {t || "—"}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className={labelClass}>First name</span>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass}
            placeholder="First name"
          />
        </label>
        <label className="space-y-2">
          <span className={labelClass}>Last name</span>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputClass}
            placeholder="Last name"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
        <label className="space-y-2">
          <span className={labelClass}>Phone</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            autoComplete="tel"
            className={inputClass}
            placeholder="+1 555 000 0000"
          />
        </label>
        <label className="space-y-2">
          <span className={labelClass}>Date of birth</span>
          <input
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            type="date"
            className={inputClass}
          />
        </label>
      </div>

      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={marketing}
          onChange={(e) => setMarketing(e.target.checked)}
          className="mt-1 h-4 w-4 accent-neutral-900"
        />
        <span className="font-sans text-[12px] leading-relaxed tracking-[0.04em] text-neutral-500">
          Keep me informed about new collections, private appointments and
          maison events.
        </span>
      </label>

      {error && (
        <p className="font-sans text-[12px] tracking-[0.08em] text-red-600">
          {error}
        </p>
      )}
      {saved && !error && (
        <p className="font-sans text-[12px] tracking-[0.1em] text-gold-600">
          Your details have been saved.
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="border border-neutral-900 px-10 py-3 font-sans text-[11px] tracking-[0.3em] text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "SAVING…" : "SAVE DETAILS"}
      </button>
    </form>
  );
}
