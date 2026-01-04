'use client';

import { Check } from 'lucide-react';
import { Framework } from '@/lib/types';
import { cn } from '@/lib/utils';

interface FrameworkSelectorProps {
  frameworks: Framework[];
  selectedIds: string[];
  onToggle: (frameworkId: string) => void;
  onSelectAll: () => void;
  className?: string;
}

export function FrameworkSelector({
  frameworks,
  selectedIds,
  onToggle,
  onSelectAll,
  className,
}: FrameworkSelectorProps) {
  const allSelected = selectedIds.length === frameworks.length;

  return (
    <div className={className}>
      <div className="mb-3 flex items-center justify-between">
        <label className="text-xs font-medium uppercase tracking-wider text-text-secondary">
          Frameworks
        </label>
        <button
          onClick={onSelectAll}
          className="text-xs font-medium text-accent hover:text-accent-hover"
        >
          {allSelected ? 'Deselect all' : 'Select all'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {frameworks.map((framework) => {
          const isSelected = selectedIds.includes(framework.id);

          return (
            <button
              key={framework.id}
              onClick={() => onToggle(framework.id)}
              className={cn(
                'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all',
                isSelected
                  ? 'border-accent bg-accent text-white'
                  : 'border-border bg-white text-text-primary hover:border-border-strong'
              )}
            >
              {isSelected && <Check className="h-3.5 w-3.5" />}
              <span>{framework.acronym || framework.name}</span>
            </button>
          );
        })}
      </div>

      {selectedIds.length === 0 && (
        <p className="mt-2 text-sm text-text-secondary">
          Select at least one framework
        </p>
      )}
    </div>
  );
}
