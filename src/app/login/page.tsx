'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Chrome } from 'lucide-react';
import { Header } from '@/components/Header';
import { useAuth } from '@/components/AuthProvider';

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading, isConfigured, signInWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/');
    }
  }, [isLoading, router, user]);

  const handleGoogle = async () => {
    setIsSubmitting(true);
    setError(null);
    const result = await signInWithGoogle();
    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <Header title="Sign In" />

      <div className="flex flex-1 items-center px-4 py-8">
        <div className="mx-auto w-full max-w-md rounded-[28px] border border-border bg-white p-6 shadow-[0_16px_60px_rgba(26,26,24,0.08)]">
          <p className="text-sm uppercase tracking-[0.2em] text-text-secondary">
            Shared Demo
          </p>
          <h1 className="mt-3 font-display text-3xl text-text-primary">
            Sign in for AI feedback
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            Anonymous visitors can practice normally. Sign in to record locally,
            analyze transcripts, and keep your feedback history.
          </p>

          {!isConfigured ? (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Supabase auth is not configured yet. Add the required environment
              variables before sharing the demo publicly.
            </div>
          ) : (
            <>
              <button
                onClick={handleGoogle}
                disabled={isSubmitting}
                className="btn btn-primary mt-6 w-full justify-center"
              >
                <Chrome className="h-4 w-4" />
                Continue with Google
              </button>

              <div className="mt-6 rounded-xl border border-border bg-bg-secondary p-4 text-sm text-text-secondary">
                Google sign-in is the only enabled login method for this demo.
                Magic-link email will stay off until a real domain and SMTP provider are in place.
              </div>
            </>
          )}

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-4 text-sm text-text-secondary">
            <Link href="/privacy" className="hover:text-text-primary">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-text-primary">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
