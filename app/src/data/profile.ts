import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabase } from "../lib/supabase";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface Profile {
  id: string;
  title: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  /** ISO date, e.g. "1990-05-21". */
  dateOfBirth: string | null;
  marketingOptIn: boolean;
}

export interface Address {
  id: string;
  label: string | null;
  recipientName: string | null;
  phone: string | null;
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}

export interface ProfileInput {
  title?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  marketingOptIn?: boolean;
}

export interface AddressInput {
  label?: string | null;
  recipientName?: string | null;
  phone?: string | null;
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
}

export type DefaultKind = "shipping" | "billing";

const NOT_CONFIGURED = "Accounts are unavailable right now. Please try again later.";
const NOT_SIGNED_IN = "Please sign in to continue.";

/* -------------------------------------------------------------------------- */
/* Row mapping                                                                */
/* -------------------------------------------------------------------------- */

interface ProfileRow {
  id: string;
  title: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  date_of_birth: string | null;
  marketing_opt_in: boolean | null;
}

interface AddressRow {
  id: string;
  label: string | null;
  recipient_name: string | null;
  phone: string | null;
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  is_default_shipping: boolean | null;
  is_default_billing: boolean | null;
  created_at: string;
}

function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    title: row.title,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    dateOfBirth: row.date_of_birth,
    marketingOptIn: Boolean(row.marketing_opt_in),
  };
}

function mapAddress(row: AddressRow): Address {
  return {
    id: row.id,
    label: row.label,
    recipientName: row.recipient_name,
    phone: row.phone,
    line1: row.line1,
    line2: row.line2,
    city: row.city,
    state: row.state,
    postalCode: row.postal_code,
    country: row.country,
    isDefaultShipping: Boolean(row.is_default_shipping),
    isDefaultBilling: Boolean(row.is_default_billing),
  };
}

function addressToRow(input: AddressInput) {
  return {
    label: input.label?.trim() || null,
    recipient_name: input.recipientName?.trim() || null,
    phone: input.phone?.trim() || null,
    line1: input.line1?.trim() || null,
    line2: input.line2?.trim() || null,
    city: input.city?.trim() || null,
    state: input.state?.trim() || null,
    postal_code: input.postalCode?.trim() || null,
    country: input.country?.trim() || null,
  };
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

async function requireUserId(supabase: SupabaseClient): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error(NOT_SIGNED_IN);
  return user.id;
}

/** Clear the given default flag on all of the user's addresses. */
async function clearDefault(
  supabase: SupabaseClient,
  userId: string,
  kind: DefaultKind,
) {
  const col = kind === "shipping" ? "is_default_shipping" : "is_default_billing";
  const { error } = await supabase
    .from("addresses")
    .update({ [col]: false })
    .eq("user_id", userId)
    .eq(col, true);
  if (error) throw new Error(error.message);
}

/** Single-line summary of an address, skipping empty parts. */
export function formatAddressLine(address: Address): string {
  return [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
}

/* -------------------------------------------------------------------------- */
/* Profile                                                                    */
/* -------------------------------------------------------------------------- */

/** The signed-in shopper's profile, or null when none has been saved yet. */
export async function getProfile(): Promise<Profile | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  // RLS scopes to the current user, so there is at most one row.
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapProfile(data as ProfileRow) : null;
}

/** Create or update the signed-in shopper's profile. */
export async function upsertProfile(input: ProfileInput): Promise<Profile> {
  const supabase = getSupabase();
  if (!supabase) throw new Error(NOT_CONFIGURED);
  const userId = await requireUserId(supabase);

  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      title: input.title?.trim() || null,
      first_name: input.firstName?.trim() || null,
      last_name: input.lastName?.trim() || null,
      phone: input.phone?.trim() || null,
      date_of_birth: input.dateOfBirth || null,
      marketing_opt_in: input.marketingOptIn ?? false,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapProfile(data as ProfileRow);
}

/* -------------------------------------------------------------------------- */
/* Addresses                                                                  */
/* -------------------------------------------------------------------------- */

/** The signed-in shopper's saved addresses, oldest first (RLS-scoped). */
export async function getAddresses(): Promise<Address[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapAddress(row as AddressRow));
}

export async function createAddress(input: AddressInput): Promise<Address> {
  const supabase = getSupabase();
  if (!supabase) throw new Error(NOT_CONFIGURED);
  const userId = await requireUserId(supabase);

  // The very first address a shopper saves becomes their default for both
  // shipping and billing, unless they say otherwise.
  const existing = await getAddresses();
  const first = existing.length === 0;
  const wantShipping = input.isDefaultShipping ?? first;
  const wantBilling = input.isDefaultBilling ?? first;

  if (wantShipping) await clearDefault(supabase, userId, "shipping");
  if (wantBilling) await clearDefault(supabase, userId, "billing");

  const { data, error } = await supabase
    .from("addresses")
    .insert({
      user_id: userId,
      ...addressToRow(input),
      is_default_shipping: wantShipping,
      is_default_billing: wantBilling,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapAddress(data as AddressRow);
}

export async function updateAddress(
  id: string,
  input: AddressInput,
): Promise<Address> {
  const supabase = getSupabase();
  if (!supabase) throw new Error(NOT_CONFIGURED);
  const userId = await requireUserId(supabase);

  if (input.isDefaultShipping) await clearDefault(supabase, userId, "shipping");
  if (input.isDefaultBilling) await clearDefault(supabase, userId, "billing");

  const patch: Record<string, unknown> = {
    ...addressToRow(input),
    updated_at: new Date().toISOString(),
  };
  if (input.isDefaultShipping !== undefined)
    patch.is_default_shipping = input.isDefaultShipping;
  if (input.isDefaultBilling !== undefined)
    patch.is_default_billing = input.isDefaultBilling;

  const { data, error } = await supabase
    .from("addresses")
    .update(patch)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapAddress(data as AddressRow);
}

export async function deleteAddress(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error(NOT_CONFIGURED);
  const userId = await requireUserId(supabase);
  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

/** Make one address the default for shipping or billing (clears the siblings). */
export async function setDefault(id: string, kind: DefaultKind): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error(NOT_CONFIGURED);
  const userId = await requireUserId(supabase);

  await clearDefault(supabase, userId, kind);
  const col = kind === "shipping" ? "is_default_shipping" : "is_default_billing";
  const { error } = await supabase
    .from("addresses")
    .update({ [col]: true, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}
