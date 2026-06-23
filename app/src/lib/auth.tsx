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
  /** Returns whether the account still needs email confirmation before sign-in. */
  signUp: (input: RegisterInput) => Promise<{ needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const NOT_CONFIGURED =
  "Accounts are unavailable right now. Please try again later.";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  // Start "loading" only when Supabase is actually configured; otherwise there
  // is no session to resolve, so we render the signed-out UI immediately.
  const [loading, setLoading] = useState(() => getSupabase() !== null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
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
    };
  }, [session, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
