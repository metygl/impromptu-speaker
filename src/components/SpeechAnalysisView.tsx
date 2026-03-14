import { Sparkles } from 'lucide-react';
import { SpeechAnalysis } from '@/lib/types';

interface SpeechAnalysisViewProps {
  analysis: SpeechAnalysis;
}

const sections: Array<{
  key: keyof Omit<SpeechAnalysis, 'improvements' | 'overallScore'>;
  label: string;
}> = [
  { key: 'clarityAndStructure', label: 'Clarity & Structure' },
  { key: 'concisenessAndWordChoice', label: 'Conciseness & Word Choice' },
  { key: 'emotionalResonance', label: 'Emotional Resonance' },
  { key: 'toneAndPresence', label: 'Tone & Presence' },
  { key: 'audienceConnection', label: 'Audience Connection' },
];

export function SpeechAnalysisView({ analysis }: SpeechAnalysisViewProps) {
  return (
    <div className="space-y-6">
      {analysis.overallScore ? (
        <div className="flex items-center justify-center rounded-xl bg-accent-subtle p-4">
          <div className="text-center">
            <span className="text-4xl font-bold text-accent">{analysis.overallScore}</span>
            <span className="text-lg text-accent">/10</span>
            <p className="mt-1 text-sm text-text-secondary">Overall Score</p>
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        {sections.map(({ key, label }) => {
          const section = analysis[key];

          return (
            <div key={key} className="rounded-xl border border-border bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-medium text-text-primary">{label}</h3>
                <span className="rounded-full bg-bg-secondary px-3 py-1 text-sm font-medium text-text-secondary">
                  {section.score}/10
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-text-primary">
                {section.feedback}
              </p>
            </div>
          );
        })}
      </div>

      {analysis.improvements.length > 0 ? (
        <div className="rounded-xl border border-border bg-white p-4">
          <h3 className="flex items-center gap-2 font-medium text-text-primary">
            <Sparkles className="h-4 w-4 text-accent" />
            Biggest Improvements
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-text-primary">
            {analysis.improvements.map((improvement, index) => (
              <li key={`${improvement}-${index}`} className="rounded-lg bg-bg-secondary px-3 py-2">
                {improvement}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
