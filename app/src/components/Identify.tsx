"use client";

import { useEffect } from "react";
import { useAuth } from "../lib/auth";
import { getSupabase } from "../lib/supabase";
import { VISITOR_KEY, readOrMintId } from "../lib/visitorId";

/**
 * Links this browser's anonymous visitor id to the signed-in customer, so the
 * Admin Live View can show *who* a session belongs to — but only once the
 * shopper has identified themselves by signing in. Nothing is sent for
 * signed-out visitors, so strangers stay anonymous.
 *
 * The customer's access token rides along so the server can verify the identity
 * itself; the browser never just asserts "I am user X" unproven. Fire-and-forget
 * like the page-view beacon — its result never affects the shopper's page.
 */
export default function Identify() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    void (async () => {
      const supabase = getSupabase();
      if (!supabase) return;

      let visitorId: string;
      try {
        visitorId = readOrMintId(localStorage, VISITOR_KEY);
      } catch {
        // Private mode / storage disabled — there is no id to link.
        return;
      }

      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token || cancelled) return;

      void fetch("/api/identify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ visitorId }),
        keepalive: true,
      }).catch(() => {});
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return null;
}
