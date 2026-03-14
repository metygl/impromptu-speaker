'use client';

import { Topic } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TopicCardProps {
  topic: Topic;
  className?: string;
}

export function TopicCard({ topic, className }: TopicCardProps) {
  return (
    <div
      className={cn(
        'card paper-texture relative overflow-hidden rounded-3xl p-8 shadow-[0_10px_40px_rgba(26,26,24,0.06)]',
        className
      )}
    >
      {/* Accent top border */}
      <div className="absolute inset-x-0 top-0 h-1 bg-accent" />

      {/* Topic label */}
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-text-secondary">
        Your Topic
      </span>

      {/* Topic text */}
      <p className="font-display mt-4 text-2xl leading-relaxed text-text-primary sm:text-3xl">
        {topic.text}
      </p>
    </div>
  );
}
