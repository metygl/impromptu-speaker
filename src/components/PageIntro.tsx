import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageIntroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function PageIntro({
  eyebrow,
  title,
  description,
  children,
  className,
}: PageIntroProps) {
  return (
    <section className={cn('mt-6', className)}>
      {eyebrow ? (
        <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">{eyebrow}</p>
      ) : null}
      <h1 className="mt-2 font-display text-3xl text-text-primary sm:text-4xl">{title}</h1>
      {description ? (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary">
          {description}
        </p>
      ) : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}
