import { getSupabase } from "../lib/supabase";
import type { CartItem } from "../lib/cart";
import type { Address } from "./profile";

/** Address details snapshotted onto an order at checkout time. */
export interface OrderAddress {
  recipientName: string | null;
  phone: string | null;
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: string | null;
  note: string | null;
  status: "pending" | "confirmed" | "fulfilled" | "cancelled";
  createdAt: string;
}

interface OrderRow {
  id: string;
  items: CartItem[] | null;
  total: string | null;
  note: string | null;
  status: Order["status"];
  created_at: string;
}

function mapOrder(row: OrderRow): Order {
  return {
    id: row.id,
    items: row.items ?? [],
    total: row.total,
    note: row.note,
    status: row.status,
    createdAt: row.created_at,
  };
}

/** Narrow a saved Address (or ad-hoc entry) to the snapshot stored on an order. */
export function toOrderAddress(address: Address | OrderAddress): OrderAddress {
  return {
    recipientName: address.recipientName ?? null,
    phone: address.phone ?? null,
    line1: address.line1 ?? null,
    line2: address.line2 ?? null,
    city: address.city ?? null,
    state: address.state ?? null,
    postalCode: address.postalCode ?? null,
    country: address.country ?? null,
  };
}

/**
 * Place an order for the signed-in shopper. RLS ties the row to their auth
 * user, so this requires an active session (enforced both here and in the DB).
 */
export async function createOrder(input: {
  items: CartItem[];
  total: string;
  note?: string;
  shippingAddress?: OrderAddress | null;
  billingAddress?: OrderAddress | null;
  phone?: string | null;
}): Promise<Order> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("The store is not configured for ordering.");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in to place your order.");
  if (input.items.length === 0) throw new Error("Your bag is empty.");

  const meta = user.user_metadata as { full_name?: string } | undefined;

  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      email: user.email,
      full_name: meta?.full_name ?? null,
      items: input.items,
      total: input.total,
      note: input.note?.trim() || null,
      shipping_address: input.shippingAddress ?? null,
      billing_address: input.billingAddress ?? null,
      phone: input.phone?.trim() || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapOrder(data as OrderRow);
}

/** The signed-in shopper's own orders, newest first (RLS-scoped). */
export async function getMyOrders(): Promise<Order[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapOrder(row as OrderRow));
}
