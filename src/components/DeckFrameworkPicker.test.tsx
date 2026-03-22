import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DeckFrameworkPicker } from './DeckFrameworkPicker';
import { getFrameworkById } from '@/lib/data/frameworks';

describe('DeckFrameworkPicker', () => {
  const framework = getFrameworkById('present-recent-future');

  it('shows selection controls for editable decks', () => {
    expect(framework).toBeDefined();

    const onToggle = vi.fn();

    render(
      <DeckFrameworkPicker
        framework={framework!}
        isEditable
        isSelected={false}
        onToggle={onToggle}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /use in deck/i }));

    expect(onToggle).toHaveBeenCalledWith('present-recent-future');
  });

  it('shows framework details after expanding', () => {
    expect(framework).toBeDefined();

    render(
      <DeckFrameworkPicker
        framework={framework!}
        isEditable={false}
        isSelected
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /see details/i }));

    expect(screen.getByText('Present')).toBeVisible();
    expect(
      screen.getByText(
        'Start with your current role, focus, or professional identity so the listener knows your present-day context.'
      )
    ).toBeVisible();
  });
});
