'use client';

import { useState } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Framework } from '@/lib/types';
import { cn } from '@/lib/utils';

interface DeckFrameworkPickerProps {
  framework: Framework;
  isSelected: boolean;
  isEditable: boolean;
  isSuggested?: boolean;
  isSaving?: boolean;
  onToggle?: (frameworkId: string) => void;
}

export function DeckFrameworkPicker({
  framework,
  isSelected,
  isEditable,
  isSuggested = false,
  isSaving = false,
  onToggle,
}: DeckFrameworkPickerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={cn(
        'overflow-hidden rounded-3xl border bg-white transition-colors',
        isSelected
          ? 'border-accent/50 bg-accent-subtle/40'
          : 'border-border bg-white',
        !isSelected && isSuggested && 'border-border-strong'
      )}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-text-primary">{framework.name}</h3>
              {framework.acronym ? (
                <span className="rounded-full border border-border bg-bg-secondary px-2 py-0.5 text-xs font-medium text-text-secondary">
                  {framework.acronym}
                </span>
              ) : null}
              {isSuggested ? (
                <span className="rounded-full border border-border bg-white px-2 py-0.5 text-xs text-text-secondary">
                  Matches this deck
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">{framework.bestFor}</p>
          </div>

          {isEditable ? (
            <button
              type="button"
              onClick={() => onToggle?.(framework.id)}
              disabled={isSaving}
              className={cn(
                'inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50',
                isSelected
                  ? 'border-accent bg-accent text-white'
                  : 'border-border text-text-secondary hover:border-accent hover:text-accent'
              )}
              aria-pressed={isSelected}
            >
              {isSelected ? <Check className="h-3.5 w-3.5" /> : null}
              {isSelected ? 'Used in deck' : 'Use in deck'}
            </button>
          ) : (
            <span
              className={cn(
                'inline-flex flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium',
                isSelected
                  ? 'border-border bg-bg-secondary text-text-primary'
                  : 'border-border/70 bg-white text-text-secondary'
              )}
            >
              {isSelected ? 'Used in deck' : 'Not used'}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {framework.steps.map((step, index) => (
              <span
                key={`${framework.id}-${step.label}`}
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-medium',
                  isSelected
                    ? 'bg-white text-accent shadow-sm'
                    : 'bg-bg-secondary text-text-secondary'
                )}
              >
                {index + 1}. {step.label}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            className="inline-flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-text-primary"
            aria-expanded={isExpanded}
          >
            {isExpanded ? 'Hide details' : 'See details'}
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isExpanded ? (
        <div className="border-t border-border bg-bg-secondary/50 px-4 py-4">
          <div className="space-y-3">
            {framework.steps.map((step, index) => (
              <div key={`${framework.id}-detail-${step.label}`} className="rounded-2xl border border-border bg-white p-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-text-primary text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <p className="font-medium text-text-primary">{step.label}</p>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {step.detailedDesc}
                </p>
              </div>
            ))}
          </div>

          {framework.tips.length > 0 ? (
            <div className="mt-4">
              <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">Tips</p>
              <ul className="mt-2 space-y-1">
                {framework.tips.map((tip) => (
                  <li key={tip} className="text-sm leading-relaxed text-text-secondary">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
