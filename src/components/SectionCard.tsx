import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function SectionCard({
  eyebrow,
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        'card paper-texture rounded-3xl border border-border bg-white p-5',
        className
      )}
    >
      {eyebrow || title || description || action ? (
        <div className="mb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              {eyebrow ? (
                <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">
                  {eyebrow}
                </p>
              ) : null}
              {title ? (
                <h2 className="mt-2 font-display text-2xl text-text-primary">{title}</h2>
              ) : null}
              {description ? (
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary">
                  {description}
                </p>
              ) : null}
            </div>
            {action ? <div className="flex-shrink-0">{action}</div> : null}
          </div>
        </div>
      ) : null}

      <div className={cn('space-y-4', contentClassName)}>{children}</div>
    </section>
  );
}
