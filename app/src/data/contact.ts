import { getSupabase } from "../lib/supabase";

export interface ContactInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
}

/**
 * Save a "Contact Us" enquiry. Uses the public anon client — visitors don't
 * need an account — and RLS allows the insert but not reads. The atelier sees
 * the message in the Admin "Messages" inbox.
 */
export async function sendContactMessage(input: ContactInput): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error("Messaging is unavailable right now. Please email us instead.");
  }

  const { error } = await supabase.from("contact_messages").insert({
    first_name: input.firstName.trim(),
    last_name: input.lastName.trim(),
    email: input.email.trim(),
    phone: input.phone?.trim() || null,
    message: input.message.trim(),
  });

  if (error) throw new Error(error.message);
}
