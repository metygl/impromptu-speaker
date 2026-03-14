import { Header } from '@/components/Header';

export default function TermsPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header title="Terms" />

      <div className="flex-1 px-4 pb-8">
        <div className="mx-auto mt-6 max-w-2xl rounded-3xl border border-border bg-white p-6">
          <h1 className="font-display text-3xl text-text-primary">Demo Terms</h1>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-text-secondary">
            <p>
              This app is provided as an early demo to test interest and collect product feedback.
            </p>
            <p>
              Access to AI analysis may be limited or changed at any time to control operating costs.
            </p>
            <p>
              Feedback is generated automatically and should be treated as coaching guidance, not as professional advice.
            </p>
            <p>
              Do not upload or speak material you are not comfortable sharing with third-party AI services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
