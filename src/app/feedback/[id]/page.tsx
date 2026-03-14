'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, FileText } from 'lucide-react';
import { Header } from '@/components/Header';
import { SpeechAnalysisView } from '@/components/SpeechAnalysisView';
import { SpeechFeedbackRecord } from '@/lib/types';

interface FeedbackDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(isoString: string) {
  return new Date(isoString).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function FeedbackDetailPage({ params }: FeedbackDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const [feedback, setFeedback] = useState<SpeechFeedbackRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetch(`/api/feedback/${id}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load feedback');
        }
        if (isMounted) {
          setFeedback(data.feedback);
          setIsLoading(false);
        }
      })
      .catch((nextError) => {
        if (!isMounted) return;
        setError(nextError instanceof Error ? nextError.message : 'Failed to load feedback');
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh flex-col">
        <Header title="Feedback" showBack onBack={() => router.push('/feedback')} />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error || !feedback) {
    return (
      <div className="flex min-h-dvh flex-col">
        <Header title="Feedback" showBack onBack={() => router.push('/feedback')} />
        <div className="flex flex-1 items-center px-4 py-8">
          <div className="mx-auto max-w-md rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error || 'Feedback not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <Header title="Feedback" showBack onBack={() => router.push('/feedback')} />

      <div className="flex-1 px-4 pb-8">
        <div className="mx-auto w-full max-w-2xl">
          <div className="mt-6 rounded-3xl border border-border bg-white p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">
              {feedback.frameworkName}
            </p>
            <h1 className="mt-2 font-display text-3xl text-text-primary">
              {feedback.topicText}
            </h1>
            <div className="mt-4 flex items-center gap-2 text-sm text-text-secondary">
              <Calendar className="h-4 w-4" />
              {formatDate(feedback.createdAt)}
            </div>
          </div>

          <div className="mt-6">
            <SpeechAnalysisView analysis={feedback.analysis} />
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-white p-5">
            <h2 className="flex items-center gap-2 font-display text-xl text-text-primary">
              <FileText className="h-5 w-5" />
              Transcript
            </h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-text-primary">
              {feedback.transcript}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
