'use client';

import { ArrowLeft, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
  onBack?: () => void;
  className?: string;
}

export function Header({
  title,
  showBack = false,
  backHref,
  onBack,
  className,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <>
      <header
        className={cn(
          'safe-top flex h-14 items-center justify-between px-4',
          className
        )}
      >
        <div className="flex items-center gap-3">
          {showBack &&
            (backHref ? (
              <Link
                href={backHref}
                className="flex h-10 w-10 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
            ) : (
              <button
                onClick={handleBack}
                className="flex h-10 w-10 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ))}

          {title && (
            <span className="text-sm font-medium text-text-primary">
              {title}
            </span>
          )}
        </div>

        <button
          onClick={() => setIsMenuOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/20" onClick={() => setIsMenuOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-64 bg-bg-primary p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-4 space-y-1">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-lg px-4 py-3 text-text-primary transition-colors hover:bg-bg-secondary"
              >
                Home
              </Link>
              <Link
                href="/setup"
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-lg px-4 py-3 text-text-primary transition-colors hover:bg-bg-secondary"
              >
                New Practice
              </Link>
              <Link
                href="/decks"
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-lg px-4 py-3 text-text-primary transition-colors hover:bg-bg-secondary"
              >
                Manage Decks
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
