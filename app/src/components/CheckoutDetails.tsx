"use client";

import { useEffect, useState } from "react";
import { COUNTRIES, countryName, postalLabel } from "../lib/countries";
import {
  getAddresses,
  getProfile,
  createAddress,
  formatAddressLine,
  type Address,
} from "../data/profile";
import { createOrder, toOrderAddress, type OrderAddress } from "../data/orders";
import type { CartItem } from "../lib/cart";

const inputClass =
  "w-full border-b border-neutral-300 bg-transparent py-3 font-sans text-sm tracking-[0.05em] text-neutral-900 placeholder-neutral-400 transition-colors focus:border-neutral-900 focus:outline-none";
const labelClass =
  "block font-sans text-[10px] uppercase tracking-[0.3em] text-neutral-400";

/** Sentinel selection meaning "enter a new address". */
const NEW = "__new__";

interface Draft {
  recipientName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const EMPTY_DRAFT: Draft = {
  recipientName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
};

function draftToOrderAddress(d: Draft): OrderAddress {
  return {
    recipientName: d.recipientName.trim() || null,
    phone: d.phone.trim() || null,
    line1: d.line1.trim() || null,
    line2: d.line2.trim() || null,
    city: d.city.trim() || null,
    state: d.state.trim() || null,
    postalCode: d.postalCode.trim() || null,
    country: d.country.trim() || null,
  };
}

function isComplete(a: OrderAddress): boolean {
  return Boolean(a.line1 && a.city && a.postalCode && a.country);
}

export default function CheckoutDetails({
  items,
  total,
  note,
  onBack,
  onPlaced,
}: {
  items: CartItem[];
  total: string;
  note: string;
  onBack: () => void;
  onPlaced: () => void;
}) {
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [shipId, setShipId] = useState<string>(NEW);
  const [shipDraft, setShipDraft] = useState<Draft>(EMPTY_DRAFT);
  const [saveShip, setSaveShip] = useState(true);

  const [billingSame, setBillingSame] = useState(true);
  const [billId, setBillId] = useState<string>(NEW);
  const [billDraft, setBillDraft] = useState<Draft>(EMPTY_DRAFT);
  const [saveBill, setSaveBill] = useState(false);

  const [phone, setPhone] = useState("");

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([getAddresses(), getProfile()])
      .then(([addrs, profile]) => {
        if (!active) return;
        setAddresses(addrs);
        const defShip = addrs.find((a) => a.isDefaultShipping) ?? addrs[0];
        const defBill = addrs.find((a) => a.isDefaultBilling) ?? defShip;
        setShipId(defShip ? defShip.id : NEW);
        setBillId(defBill ? defBill.id : NEW);
        setPhone(profile?.phone ?? defShip?.phone ?? "");
      })
      .catch((err) => {
        if (!active) return;
        setLoadError(
          err instanceof Error ? err.message : "Could not load your details.",
        );
        setAddresses([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const addressById = (id: string) => addresses?.find((a) => a.id === id);

  function resolveShipping(): OrderAddress {
    if (shipId === NEW) return draftToOrderAddress(shipDraft);
    const a = addressById(shipId);
    return a ? toOrderAddress(a) : draftToOrderAddress(shipDraft);
  }

  function resolveBilling(shipping: OrderAddress): OrderAddress {
    if (billingSame) return shipping;
    if (billId === NEW) return draftToOrderAddress(billDraft);
    const a = addressById(billId);
    return a ? toOrderAddress(a) : draftToOrderAddress(billDraft);
  }

  async function placeOrder() {
    if (placing) return;
    setError(null);

    const shipping = resolveShipping();
    if (!isComplete(shipping)) {
      setError("Please complete your shipping address.");
      return;
    }
    if (!phone.trim()) {
      setError("Please add a contact phone number.");
      return;
    }
    const billing = resolveBilling(shipping);
    if (!isComplete(billing)) {
      setError("Please complete your billing address.");
      return;
    }

    setPlacing(true);
    try {
      // Save new addresses to the shopper's book when they opted in.
      const noneSaved = (addresses?.length ?? 0) === 0;
      if (shipId === NEW && saveShip) {
        await createAddress({
          ...shipDraft,
          isDefaultShipping: noneSaved,
          isDefaultBilling: noneSaved && billingSame,
        });
      }
      if (!billingSame && billId === NEW && saveBill) {
        await createAddress({ ...billDraft });
      }

      await createOrder({
        items,
        total,
        note,
        shippingAddress: { ...shipping, phone: shipping.phone ?? phone.trim() },
        billingAddress: billing,
        phone: phone.trim(),
      });
      onPlaced();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not place your order.");
      setPlacing(false);
    }
  }

  if (addresses === null) {
    return (
      <p className="mt-16 text-center font-sans text-[11px] tracking-[0.3em] text-neutral-400">
        LOADING…
      </p>
    );
  }

  const saved = addresses;

  return (
    <div className="mx-auto mt-16 grid max-w-5xl gap-16 lg:grid-cols-[1fr_360px]">
      {/* Details */}
      <div className="space-y-14">
        {loadError && (
          <p className="font-sans text-[12px] tracking-[0.08em] text-red-600">
            {loadError}
          </p>
        )}

        {/* Shipping */}
        <section>
          <h2 className="border-b border-neutral-200 pb-4 font-sans text-[11px] tracking-[0.35em] text-neutral-700">
            SHIPPING ADDRESS
          </h2>
          {saved.length > 0 && (
            <AddressPicker
              addresses={saved}
              value={shipId}
              onChange={setShipId}
            />
          )}
          {shipId === NEW && (
            <>
              <AddressFields draft={shipDraft} onChange={setShipDraft} />
              <label className="mt-5 flex items-center gap-3 font-sans text-[12px] tracking-[0.04em] text-neutral-500">
                <input
                  type="checkbox"
                  checked={saveShip}
                  onChange={(e) => setSaveShip(e.target.checked)}
                  className="h-4 w-4 accent-neutral-900"
                />
                Save this address to my address book
              </label>
            </>
          )}
        </section>

        {/* Billing */}
        <section>
          <h2 className="border-b border-neutral-200 pb-4 font-sans text-[11px] tracking-[0.35em] text-neutral-700">
            BILLING ADDRESS
          </h2>
          <label className="mt-6 flex items-center gap-3 font-sans text-[12px] tracking-[0.04em] text-neutral-500">
            <input
              type="checkbox"
              checked={billingSame}
              onChange={(e) => setBillingSame(e.target.checked)}
              className="h-4 w-4 accent-neutral-900"
            />
            Same as shipping address
          </label>
          {!billingSame && (
            <div className="mt-6">
              {saved.length > 0 && (
                <AddressPicker
                  addresses={saved}
                  value={billId}
                  onChange={setBillId}
                />
              )}
              {billId === NEW && (
                <>
                  <AddressFields draft={billDraft} onChange={setBillDraft} />
                  <label className="mt-5 flex items-center gap-3 font-sans text-[12px] tracking-[0.04em] text-neutral-500">
                    <input
                      type="checkbox"
                      checked={saveBill}
                      onChange={(e) => setSaveBill(e.target.checked)}
                      className="h-4 w-4 accent-neutral-900"
                    />
                    Save this address to my address book
                  </label>
                </>
              )}
            </div>
          )}
        </section>

        {/* Contact */}
        <section>
          <h2 className="border-b border-neutral-200 pb-4 font-sans text-[11px] tracking-[0.35em] text-neutral-700">
            CONTACT
          </h2>
          <label className="mt-6 block max-w-sm space-y-2">
            <span className={labelClass}>Phone</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              autoComplete="tel"
              placeholder="+1 555 000 0000"
              className={inputClass}
            />
          </label>
        </section>
      </div>

      {/* Summary */}
      <aside className="lg:pt-2">
        <div className="border-t border-neutral-900 pt-6">
          <h2 className="font-sans text-[11px] tracking-[0.3em] text-neutral-700">
            ORDER SUMMARY
          </h2>
          <ul className="mt-5 space-y-3">
            {items.map((item) => (
              <li
                key={`${item.slug}-${item.material}`}
                className="flex justify-between gap-4 font-sans text-[13px] tracking-[0.03em] text-neutral-600"
              >
                <span className="min-w-0">
                  {item.name}
                  <span className="text-neutral-400">
                    {item.material ? ` · ${item.material}` : ""} × {item.quantity}
                  </span>
                </span>
                <span className="shrink-0 text-neutral-500">{item.price}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex justify-between border-t border-neutral-200 pt-5 font-sans text-[12px] tracking-[0.2em] text-neutral-500">
            <span>SUBTOTAL</span>
            <span className="font-serif text-lg font-light tracking-[0.05em] text-neutral-900">
              {total}
            </span>
          </div>
          {note && (
            <p className="mt-4 font-sans text-[11px] leading-relaxed tracking-[0.04em] text-neutral-400">
              Note: {note}
            </p>
          )}
          <p className="mt-4 font-sans text-[11px] leading-relaxed tracking-[0.05em] text-neutral-400">
            ÉLORIS pieces are made to order. Placing this order sends your
            details to your client advisor, who confirms availability and
            arranges secure payment and delivery.
          </p>
        </div>

        {error && (
          <p className="mt-6 font-sans text-[12px] tracking-[0.08em] text-red-600">
            {error}
          </p>
        )}

        <button
          onClick={placeOrder}
          disabled={placing}
          className="mt-8 w-full bg-neutral-900 px-10 py-4 font-sans text-[11px] tracking-[0.3em] text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {placing ? "PLACING ORDER…" : "PLACE ORDER"}
        </button>
        <button
          onClick={onBack}
          className="mt-6 block w-full text-center font-sans text-[11px] tracking-[0.2em] text-neutral-400 transition-colors hover:text-neutral-900"
        >
          BACK TO BAG
        </button>
      </aside>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sub-components                                                              */
/* -------------------------------------------------------------------------- */

function AddressPicker({
  addresses,
  value,
  onChange,
}: {
  addresses: Address[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="mt-6 space-y-4">
      {addresses.map((a) => (
        <label
          key={a.id}
          className="flex cursor-pointer items-start gap-3"
        >
          <input
            type="radio"
            checked={value === a.id}
            onChange={() => onChange(a.id)}
            className="mt-1 accent-neutral-900"
          />
          <span className="min-w-0">
            <span className="block font-sans text-[13px] tracking-[0.04em] text-neutral-800">
              {a.recipientName || a.label || "Saved address"}
            </span>
            <span className="block font-sans text-[12px] leading-relaxed tracking-[0.03em] text-neutral-400">
              {formatAddressLine({ ...a, country: countryName(a.country) })}
            </span>
          </span>
        </label>
      ))}
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="radio"
          checked={value === NEW}
          onChange={() => onChange(NEW)}
          className="accent-neutral-900"
        />
        <span className="font-sans text-[13px] tracking-[0.04em] text-neutral-800">
          Use a new address
        </span>
      </label>
    </div>
  );
}

function AddressFields({
  draft,
  onChange,
}: {
  draft: Draft;
  onChange: (d: Draft) => void;
}) {
  const set =
    (key: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onChange({ ...draft, [key]: e.target.value });

  return (
    <div className="mt-6 grid grid-cols-1 gap-7 sm:grid-cols-2">
      <label className="space-y-2 sm:col-span-2">
        <span className={labelClass}>Recipient name</span>
        <input
          value={draft.recipientName}
          onChange={set("recipientName")}
          autoComplete="name"
          className={inputClass}
        />
      </label>
      <label className="space-y-2 sm:col-span-2">
        <span className={labelClass}>Address line 1</span>
        <input
          value={draft.line1}
          onChange={set("line1")}
          autoComplete="address-line1"
          className={inputClass}
        />
      </label>
      <label className="space-y-2 sm:col-span-2">
        <span className={labelClass}>Address line 2 (optional)</span>
        <input
          value={draft.line2}
          onChange={set("line2")}
          autoComplete="address-line2"
          className={inputClass}
        />
      </label>
      <label className="space-y-2">
        <span className={labelClass}>City</span>
        <input
          value={draft.city}
          onChange={set("city")}
          autoComplete="address-level2"
          className={inputClass}
        />
      </label>
      <label className="space-y-2">
        <span className={labelClass}>State / Region</span>
        <input
          value={draft.state}
          onChange={set("state")}
          autoComplete="address-level1"
          className={inputClass}
        />
      </label>
      <label className="space-y-2">
        <span className={labelClass}>Country</span>
        <select
          value={draft.country}
          onChange={set("country")}
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
        <span className={labelClass}>{postalLabel(draft.country)}</span>
        <input
          value={draft.postalCode}
          onChange={set("postalCode")}
          autoComplete="postal-code"
          className={inputClass}
        />
      </label>
    </div>
  );
}
