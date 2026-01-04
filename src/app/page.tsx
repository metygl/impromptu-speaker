'use client';

import Link from 'next/link';
import { Mic, Settings, Layers, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* Hero Section */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-12 pt-20">
        {/* Logo/Icon */}
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10">
          <Mic className="h-10 w-10 text-accent" />
        </div>

        {/* Title */}
        <h1 className="font-display text-center text-4xl text-text-primary sm:text-5xl">
          Impromptu
        </h1>
        <p className="mt-3 max-w-xs text-center text-text-secondary">
          Master the art of speaking on the spot with structured frameworks
        </p>

        {/* Quick Start Button */}
        <Link
          href="/setup"
          className="btn btn-primary mt-10 gap-3 px-8 py-4 text-lg"
        >
          <Sparkles className="h-5 w-5" />
          Start Practice
        </Link>

        {/* Features */}
        <div className="mt-16 grid w-full max-w-sm gap-4">
          <div className="flex items-center gap-4 rounded-xl bg-bg-secondary p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
              <Layers className="h-5 w-5 text-text-secondary" />
            </div>
            <div>
              <div className="font-medium text-text-primary">Topic Decks</div>
              <div className="text-sm text-text-secondary">
                Create custom topic collections
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl bg-bg-secondary p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
              <Settings className="h-5 w-5 text-text-secondary" />
            </div>
            <div>
              <div className="font-medium text-text-primary">8 Frameworks</div>
              <div className="text-sm text-text-secondary">
                PREP, STAR, and more structures
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="safe-bottom border-t border-border bg-white px-6 py-4">
        <div className="flex justify-center gap-4">
          <Link
            href="/decks"
            className="btn btn-ghost text-sm"
          >
            <Layers className="h-4 w-4" />
            Manage Decks
          </Link>
        </div>
      </div>
    </div>
  );
}
