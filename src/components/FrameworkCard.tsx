'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Framework } from '@/lib/types';
import { cn } from '@/lib/utils';

interface FrameworkCardProps {
  framework: Framework;
  currentStepIndex?: number;
  className?: string;
}

export function FrameworkCard({
  framework,
  currentStepIndex,
  className,
}: FrameworkCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={cn('card overflow-hidden', className)}>
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-bg-secondary"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-text-primary">
            {framework.name}
          </span>

          {/* Step pills */}
          <div className="flex items-center gap-1">
            {framework.steps.map((step, index) => (
              <div key={step.label} className="flex items-center">
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium transition-colors',
                    currentStepIndex === index
                      ? 'bg-accent text-white'
                      : 'bg-bg-secondary text-text-secondary'
                  )}
                >
                  {step.label.charAt(0)}
                </span>
                {index < framework.steps.length - 1 && (
                  <span className="mx-0.5 text-text-secondary/40">→</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-text-secondary">
          <span className="text-xs">Details</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-out',
          isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="border-t border-border px-4 pb-4 pt-3">
          {/* Best for */}
          <p className="mb-4 text-sm text-text-secondary">
            <span className="font-medium text-text-primary">Best for: </span>
            {framework.bestFor}
          </p>

          {/* Steps */}
          <div className="space-y-4">
            {framework.steps.map((step, index) => (
              <div
                key={step.label}
                className={cn(
                  'rounded-lg border p-3 transition-colors',
                  currentStepIndex === index
                    ? 'border-accent/30 bg-accent-subtle'
                    : 'border-border bg-bg-secondary/50'
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                      currentStepIndex === index
                        ? 'bg-accent text-white'
                        : 'bg-text-primary text-white'
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className="font-semibold text-text-primary">
                    {step.label}
                  </span>
                  {step.suggestedSeconds && (
                    <span className="ml-auto text-xs text-text-secondary">
                      ~{Math.round(step.suggestedSeconds / 60 * 10) / 10} min
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm text-text-secondary">
                  {step.detailedDesc}
                </p>

                {/* Example phrases */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {step.examplePhrases.slice(0, 2).map((phrase, i) => (
                    <span
                      key={i}
                      className="rounded-md bg-white px-2 py-1 text-xs italic text-text-secondary shadow-sm"
                    >
                      "{phrase}"
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          {framework.tips.length > 0 && (
            <div className="mt-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Tips
              </span>
              <ul className="mt-2 space-y-1">
                {framework.tips.map((tip, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-text-secondary"
                  >
                    <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-accent" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
