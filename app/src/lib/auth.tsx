"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";

interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface AuthContextValue {
  /** Current signed-in user, or null when signed out / still loading. */
  user: User | null;
  /** True until the initial session has been resolved from storage. */
  loading: boolean;
  /** Convenience: best-available display name for the user. */
  displayName: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  /** Begin an OAuth sign-in (Google / Apple). Redirects the browser away. */
  signInWithProvider: (provider: "google" | "apple") => Promise<void>;
  /** Returns whether the account still needs email confirmation before sign-in. */
  signUp: (input: RegisterInput) => Promise<{ needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  /** Update the name stored in auth metadata so the greeting stays in sync. */
  updateDisplayName: (firstName: string, lastName: string) => Promise<void>;
  /** Email the shopper a password-reset link. */
  resetPassword: (email: string) => Promise<void>;
  /** Set a new password (used after following a reset link, or while signed in). */
  updatePassword: (newPassword: string) => Promise<void>;
  /** True after the shopper follows a password-reset link — show the new-password form. */
  recovery: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const NOT_CONFIGURED =
  "Accounts are unavailable right now. Please try again later.";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  // Start "loading" only when Supabase is actually configured; otherwise there
  // is no session to resolve, so we render the signed-out UI immediately.
  const [loading, setLoading] = useState(() => getSupabase() !== null);
  // True once the shopper arrives via a password-reset email link.
  const [recovery, setRecovery] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const user = session?.user ?? null;
    const meta = user?.user_metadata as
      | { full_name?: string; first_name?: string }
      | undefined;

    return {
      user,
      loading,
      displayName: meta?.full_name || meta?.first_name || user?.email || null,

      async signIn(email, password) {
        const supabase = getSupabase();
        if (!supabase) throw new Error(NOT_CONFIGURED);
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw new Error(error.message);
      },

      async signInWithProvider(provider) {
        const supabase = getSupabase();
        if (!supabase) throw new Error(NOT_CONFIGURED);
        // Come back to the page the shopper started from (e.g. /account, or the
        // ?redirect target used by "sign in to order"). Same-origin paths only.
        const redirect = new URLSearchParams(window.location.search).get(
          "redirect",
        );
        const path =
          redirect && /^\/(?![/\\])/.test(redirect) ? redirect : "/account";
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: { redirectTo: `${window.location.origin}${path}` },
        });
        if (error) throw new Error(error.message);
      },

      async signUp({ firstName, lastName, email, password }) {
        const supabase = getSupabase();
        if (!supabase) throw new Error(NOT_CONFIGURED);
        const fullName = `${firstName} ${lastName}`.trim();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              full_name: fullName,
            },
          },
        });
        if (error) throw new Error(error.message);
        // When email confirmation is enabled, signUp returns no session.
        return { needsConfirmation: !data.session };
      },

      async signOut() {
        const supabase = getSupabase();
        if (!supabase) return;
        await supabase.auth.signOut();
      },

      async updateDisplayName(firstName, lastName) {
        const supabase = getSupabase();
        if (!supabase) return;
        const fullName = `${firstName} ${lastName}`.trim();
        const { error } = await supabase.auth.updateUser({
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: fullName,
          },
        });
        // A USER_UPDATED event refreshes the session (and thus displayName).
        if (error) throw new Error(error.message);
      },

      async resetPassword(email) {
        const supabase = getSupabase();
        if (!supabase) throw new Error(NOT_CONFIGURED);
        // The link in the email returns the shopper to /account, where the
        // PASSWORD_RECOVERY event flips `recovery` on and shows the reset form.
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/account`,
        });
        if (error) throw new Error(error.message);
      },

      async updatePassword(newPassword) {
        const supabase = getSupabase();
        if (!supabase) throw new Error(NOT_CONFIGURED);
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (error) throw new Error(error.message);
        setRecovery(false);
      },

      recovery,
    };
  }, [session, loading, recovery]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
