import { Header } from '@/components/Header';

export default function PrivacyPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header title="Privacy" showBack backHref="/" />

      <div className="flex-1 px-4 pb-8">
        <div className="mx-auto mt-6 max-w-2xl rounded-3xl border border-border bg-white p-6">
          <h1 className="font-display text-3xl text-text-primary">Privacy</h1>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-text-secondary">
            <p>
              Anonymous visitors can use the app without recording or AI analysis.
            </p>
            <p>
              Signed-in users record audio locally in their browser. Audio is not uploaded to the server for the shared demo.
            </p>
            <p>
              When you request AI feedback, the app stores the transcript, evaluation, topic, framework, and usage metadata so you can revisit feedback later and so daily limits can be enforced.
            </p>
            <p>
              This is a demo product. Avoid sharing sensitive or confidential information in speeches.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
