import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FlowActionsProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FlowActions({
  title = 'Keep going',
  description,
  children,
  className,
}: FlowActionsProps) {
  return (
    <section
      className={cn(
        'paper-texture mt-8 rounded-3xl border border-border bg-white p-5 shadow-[0_10px_40px_rgba(26,26,24,0.05)]',
        className
      )}
    >
      <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">{title}</p>
      {description ? (
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary">{description}</p>
      ) : null}
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}
