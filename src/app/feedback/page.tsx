'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, History, Mic, Sparkles } from 'lucide-react';
import { FlowActions } from '@/components/FlowActions';
import { Header } from '@/components/Header';
import { PageIntro } from '@/components/PageIntro';
import { useAuth } from '@/components/AuthProvider';
import { SpeechFeedbackRecord } from '@/lib/types';

function formatDate(isoString: string) {
  return new Date(isoString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function FeedbackPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [feedback, setFeedback] = useState<SpeechFeedbackRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    fetch('/api/feedback')
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load feedback history');
        }
        if (isMounted) {
          setFeedback(data.feedback ?? []);
          setIsLoading(false);
        }
      })
      .catch((nextError) => {
        if (!isMounted) return;
        setError(nextError instanceof Error ? nextError.message : 'Failed to load feedback history');
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, user]);

  if (isAuthLoading || (user && isLoading)) {
    return (
      <div className="flex min-h-dvh flex-col">
        <Header title="Feedback" />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh flex-col">
        <Header title="Feedback" />
        <div className="flex flex-1 items-center px-4 py-8">
          <div className="mx-auto max-w-md rounded-3xl border border-border bg-white p-6 text-center shadow-[0_16px_60px_rgba(26,26,24,0.08)]">
            <Sparkles className="mx-auto h-10 w-10 text-accent" />
            <h1 className="mt-4 font-display text-3xl text-text-primary">
              Sign in to keep feedback
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              Your transcript and AI evaluation history are available only for signed-in users.
            </p>
            <Link href="/login" className="btn btn-primary mt-6">
              <ArrowRight className="h-4 w-4" />
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <Header title="Feedback" />

      <div className="flex-1 px-4 pb-8">
        <div className="mx-auto w-full max-w-2xl">
          <PageIntro
            eyebrow="Signed in"
            title="Feedback history"
            description="Review past sessions and open any one for the full transcript and AI feedback."
          />

          {error ? (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {feedback.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-dashed border-border-strong bg-bg-secondary p-8 text-center">
              <h2 className="font-display text-2xl text-text-primary">No feedback yet</h2>
              <p className="mt-3 text-sm text-text-secondary">
                Finish a practice session and run AI analysis to populate your history.
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {feedback.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/feedback/${entry.id}`}
                  className="block rounded-2xl border border-border bg-white p-5 transition-transform hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">
                        {entry.frameworkName}
                      </p>
                      <h2 className="mt-2 text-lg font-medium text-text-primary">
                        {entry.topicText}
                      </h2>
                      <p className="mt-3 text-sm text-text-secondary">
                        {formatDate(entry.createdAt)}
                      </p>
                    </div>
                    <div className="rounded-full bg-accent-subtle px-3 py-1 text-sm font-medium text-accent">
                      {entry.overallScore ?? entry.analysis.overallScore ?? '—'}/10
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-text-secondary">
                    <span className="rounded-full bg-bg-secondary px-3 py-1">
                      Transcript saved
                    </span>
                    <span className="rounded-full bg-bg-secondary px-3 py-1">
                      Detailed feedback
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <FlowActions description="Use the next step to stay in the practice loop or revisit what you recorded locally.">
            <Link href="/setup" className="btn btn-primary w-full justify-center">
              <Mic className="h-4 w-4" />
              Start a New Session
            </Link>
            <Link href="/recordings" className="btn btn-secondary w-full justify-center">
              <History className="h-4 w-4" />
              Review Local Recordings
            </Link>
          </FlowActions>
        </div>
      </div>
    </div>
  );
}
