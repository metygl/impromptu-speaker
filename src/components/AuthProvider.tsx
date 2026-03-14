'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  startTransition,
} from 'react';
import { useRouter } from 'next/navigation';
import { Session, User } from '@supabase/supabase-js';
import { getAuthRedirectUrl, getSupabasePublicEnv } from '@/lib/env';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithMagicLink: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isConfigured } = getSupabasePublicEnv();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(isConfigured);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) return;
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setIsLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      startTransition(() => {
        router.refresh();
      });
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, [router]);

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      session,
      isLoading,
      isConfigured,
      async signInWithGoogle() {
        const supabase = getSupabaseBrowserClient();

        if (!supabase) {
          return { error: 'Supabase auth is not configured yet.' };
        }

        const redirectTo =
          getAuthRedirectUrl() ??
          (typeof window !== 'undefined'
            ? `${window.location.origin}/auth/callback`
            : undefined);

        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });

        return error ? { error: error.message } : {};
      },
      async signInWithMagicLink(email: string) {
        const supabase = getSupabaseBrowserClient();

        if (!supabase) {
          return { error: 'Supabase auth is not configured yet.' };
        }

        const emailRedirectTo =
          getAuthRedirectUrl() ??
          (typeof window !== 'undefined'
            ? `${window.location.origin}/auth/callback`
            : undefined);

        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo,
          },
        });

        return error ? { error: error.message } : {};
      },
      async signOut() {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) return;
        await supabase.auth.signOut();
      },
    };
  }, [isConfigured, isLoading, session, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
