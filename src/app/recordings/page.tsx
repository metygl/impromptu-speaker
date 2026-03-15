'use client';

import Link from 'next/link';
import { Archive, Mic, Sparkles } from 'lucide-react';
import { FlowActions } from '@/components/FlowActions';
import { Header } from '@/components/Header';
import { PageIntro } from '@/components/PageIntro';

export default function RecordingsPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header title="Recordings" />

      <div className="flex-1 px-4 pb-8">
        <div className="mx-auto w-full max-w-2xl">
          <PageIntro
            eyebrow="Archived"
            title="Local recordings list is archived"
            description="For now, the dedicated recordings index is no longer part of the main flow. New saves still open directly on their recording detail page, and analyzed sessions are easiest to revisit from feedback history."
          />

          <div className="mt-8 rounded-3xl border border-border bg-white p-6 shadow-[0_16px_60px_rgba(26,26,24,0.08)]">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-subtle text-accent">
                <Archive className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-2xl text-text-primary">What changed</h2>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  Local audio still stays on this device. The active review loop now centers on
                  direct recording detail pages and saved feedback pages instead of a separate
                  recordings list.
                </p>
              </div>
            </div>
          </div>

          <FlowActions description="Use one path to revisit analyzed sessions, or start another round right away.">
            <Link href="/feedback" className="btn btn-primary w-full justify-center">
              <Sparkles className="h-4 w-4" />
              Open Feedback History
            </Link>
            <Link href="/setup" className="btn btn-secondary w-full justify-center">
              <Mic className="h-4 w-4" />
              Start a New Session
            </Link>
          </FlowActions>
        </div>
      </div>
    </div>
  );
}
