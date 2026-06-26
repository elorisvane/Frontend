"use client";

import { useEffect, useState } from "react";
import { COUNTRIES, countryName, postalLabel } from "../../lib/countries";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefault,
  formatAddressLine,
  type Address,
  type AddressInput,
} from "../../data/profile";

const inputClass =
  "w-full border-b border-neutral-300 bg-transparent py-3 font-sans text-sm tracking-[0.05em] text-neutral-900 placeholder-neutral-400 transition-colors focus:border-neutral-900 focus:outline-none";
const labelClass =
  "block font-sans text-[10px] uppercase tracking-[0.3em] text-neutral-400";

export default function AddressBook() {
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** The address being edited, "new" for the add form, or null when idle. */
  const [editing, setEditing] = useState<Address | "new" | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function refresh() {
    try {
      setAddresses(await getAddresses());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load addresses.");
    }
  }

  useEffect(() => {
    let active = true;
    getAddresses()
      .then((data) => active && setAddresses(data))
      .catch(
        (err) =>
          active &&
          setError(
            err instanceof Error ? err.message : "Could not load addresses.",
          ),
      );
    return () => {
      active = false;
    };
  }, []);

  async function handleDelete(id: string) {
    setError(null);
    setBusyId(id);
    try {
      await deleteAddress(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete address.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleSetDefault(id: string, kind: "shipping" | "billing") {
    setError(null);
    setBusyId(id);
    try {
      await setDefault(id, kind);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update default.");
    } finally {
      setBusyId(null);
    }
  }

  if (addresses === null && !error) {
    return (
      <p className="mt-8 font-sans text-[11px] tracking-[0.3em] text-neutral-400">
        LOADING…
      </p>
    );
  }

  return (
    <div className="mt-8">
      {error && (
        <p className="mb-6 font-sans text-[12px] tracking-[0.08em] text-red-600">
          {error}
        </p>
      )}

      {addresses && addresses.length > 0 && (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {addresses.map((a) => (
            <li
              key={a.id}
              className="flex flex-col border border-neutral-200 p-6"
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {a.label && (
                  <span className="font-sans text-[11px] tracking-[0.2em] text-neutral-700">
                    {a.label.toUpperCase()}
                  </span>
                )}
                {a.isDefaultShipping && (
                  <span className="border border-gold-300 px-2 py-0.5 font-sans text-[9px] uppercase tracking-[0.2em] text-gold-600">
                    Default shipping
                  </span>
                )}
                {a.isDefaultBilling && (
                  <span className="border border-gold-300 px-2 py-0.5 font-sans text-[9px] uppercase tracking-[0.2em] text-gold-600">
                    Default billing
                  </span>
                )}
              </div>

              {a.recipientName && (
                <p className="font-serif text-lg font-light tracking-[0.03em] text-neutral-900">
                  {a.recipientName}
                </p>
              )}
              <p className="mt-1 font-sans text-[13px] leading-relaxed tracking-[0.03em] text-neutral-500">
                {formatAddressLine({ ...a, country: countryName(a.country) })}
              </p>
              {a.phone && (
                <p className="mt-1 font-sans text-[12px] tracking-[0.04em] text-neutral-400">
                  {a.phone}
                </p>
              )}

              <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-5 font-sans text-[10px] tracking-[0.2em]">
                <button
                  onClick={() => setEditing(a)}
                  className="text-neutral-500 transition-colors hover:text-neutral-900"
                >
                  EDIT
                </button>
                <button
                  disabled={busyId === a.id}
                  onClick={() => handleDelete(a.id)}
                  className="text-neutral-400 transition-colors hover:text-red-600 disabled:opacity-50"
                >
                  DELETE
                </button>
                {!a.isDefaultShipping && (
                  <button
                    disabled={busyId === a.id}
                    onClick={() => handleSetDefault(a.id, "shipping")}
                    className="text-neutral-400 transition-colors hover:text-neutral-900 disabled:opacity-50"
                  >
                    SET SHIPPING
                  </button>
                )}
                {!a.isDefaultBilling && (
                  <button
                    disabled={busyId === a.id}
                    onClick={() => handleSetDefault(a.id, "billing")}
                    className="text-neutral-400 transition-colors hover:text-neutral-900 disabled:opacity-50"
                  >
                    SET BILLING
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {addresses && addresses.length === 0 && !editing && (
        <p className="font-sans text-[13px] tracking-[0.04em] text-neutral-400">
          You have no saved addresses yet.
        </p>
      )}

      {editing ? (
        <AddressForm
          address={editing === "new" ? null : editing}
          onCancel={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await refresh();
          }}
        />
      ) : (
        <button
          onClick={() => setEditing("new")}
          className="mt-8 border border-neutral-900 px-10 py-3 font-sans text-[11px] tracking-[0.3em] text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white"
        >
          ADD AN ADDRESS
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Add / edit form                                                            */
/* -------------------------------------------------------------------------- */

function AddressForm({
  address,
  onCancel,
  onSaved,
}: {
  address: Address | null;
  onCancel: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const [label, setLabel] = useState(address?.label ?? "");
  const [recipientName, setRecipientName] = useState(address?.recipientName ?? "");
  const [phone, setPhone] = useState(address?.phone ?? "");
  const [line1, setLine1] = useState(address?.line1 ?? "");
  const [line2, setLine2] = useState(address?.line2 ?? "");
  const [city, setCity] = useState(address?.city ?? "");
  const [state, setState] = useState(address?.state ?? "");
  const [postalCode, setPostalCode] = useState(address?.postalCode ?? "");
  const [country, setCountry] = useState(address?.country ?? "US");
  const [defShipping, setDefShipping] = useState(address?.isDefaultShipping ?? false);
  const [defBilling, setDefBilling] = useState(address?.isDefaultBilling ?? false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    setError(null);
    setSaving(true);

    const input: AddressInput = {
      label,
      recipientName,
      phone,
      line1,
      line2,
      city,
      state,
      postalCode,
      country,
      isDefaultShipping: defShipping,
      isDefaultBilling: defBilling,
    };

    try {
      if (address) await updateAddress(address.id, input);
      else await createAddress(input);
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save address.");
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 border border-neutral-200 p-6 sm:p-8"
    >
      <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-neutral-500">
        {address ? "Edit address" : "New address"}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-7 sm:grid-cols-2">
        <label className="space-y-2">
          <span className={labelClass}>Label (optional)</span>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Home, Office…"
            className={inputClass}
          />
        </label>
        <label className="space-y-2">
          <span className={labelClass}>Recipient name</span>
          <input
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            autoComplete="name"
            className={inputClass}
          />
        </label>
        <label className="space-y-2 sm:col-span-2">
          <span className={labelClass}>Address line 1</span>
          <input
            required
            value={line1}
            onChange={(e) => setLine1(e.target.value)}
            autoComplete="address-line1"
            className={inputClass}
          />
        </label>
        <label className="space-y-2 sm:col-span-2">
          <span className={labelClass}>Address line 2 (optional)</span>
          <input
            value={line2}
            onChange={(e) => setLine2(e.target.value)}
            autoComplete="address-line2"
            className={inputClass}
          />
        </label>
        <label className="space-y-2">
          <span className={labelClass}>City</span>
          <input
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            autoComplete="address-level2"
            className={inputClass}
          />
        </label>
        <label className="space-y-2">
          <span className={labelClass}>State / Region</span>
          <input
            value={state}
            onChange={(e) => setState(e.target.value)}
            autoComplete="address-level1"
            className={inputClass}
          />
        </label>
        <label className="space-y-2">
          <span className={labelClass}>Country</span>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            autoComplete="country"
            className={inputClass}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className={labelClass}>{postalLabel(country)}</span>
          <input
            required
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            autoComplete="postal-code"
            className={inputClass}
          />
        </label>
        <label className="space-y-2 sm:col-span-2">
          <span className={labelClass}>Phone</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            autoComplete="tel"
            className={inputClass}
          />
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <label className="flex items-center gap-3 font-sans text-[12px] tracking-[0.04em] text-neutral-500">
          <input
            type="checkbox"
            checked={defShipping}
            onChange={(e) => setDefShipping(e.target.checked)}
            className="h-4 w-4 accent-neutral-900"
          />
          Use as my default shipping address
        </label>
        <label className="flex items-center gap-3 font-sans text-[12px] tracking-[0.04em] text-neutral-500">
          <input
            type="checkbox"
            checked={defBilling}
            onChange={(e) => setDefBilling(e.target.checked)}
            className="h-4 w-4 accent-neutral-900"
          />
          Use as my default billing address
        </label>
      </div>

      {error && (
        <p className="mt-5 font-sans text-[12px] tracking-[0.08em] text-red-600">
          {error}
        </p>
      )}

      <div className="mt-7 flex items-center gap-6">
        <button
          type="submit"
          disabled={saving}
          className="bg-neutral-900 px-10 py-3 font-sans text-[11px] tracking-[0.3em] text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "SAVING…" : "SAVE ADDRESS"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="font-sans text-[11px] tracking-[0.3em] text-neutral-400 transition-colors hover:text-neutral-900"
        >
          CANCEL
        </button>
      </div>
    </form>
  );
}
