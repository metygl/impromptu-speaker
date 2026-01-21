import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecordingCard } from './RecordingCard';
import { Recording } from '@/lib/types';

const mockRecording: Recording = {
  id: 'test-id',
  name: 'Test Recording',
  createdAt: '2024-01-15T10:30:00.000Z',
  durationSeconds: 125,
  topicId: 'topic-1',
  topicText: 'What is your greatest achievement in life so far?',
  frameworkId: 'prep',
  frameworkName: 'PREP',
  speechDurationSetting: 180,
  fileSize: 1024 * 500, // 500KB
};

describe('RecordingCard', () => {
  it('should render recording name', () => {
    render(<RecordingCard recording={mockRecording} />);

    expect(screen.getByText('Test Recording')).toBeInTheDocument();
  });

  it('should render topic text', () => {
    render(<RecordingCard recording={mockRecording} />);

    expect(screen.getByText(/What is your greatest achievement/)).toBeInTheDocument();
  });

  it('should render formatted duration', () => {
    render(<RecordingCard recording={mockRecording} />);

    expect(screen.getByText('2:05')).toBeInTheDocument();
  });

  it('should render file size', () => {
    render(<RecordingCard recording={mockRecording} />);

    expect(screen.getByText('500.0 KB')).toBeInTheDocument();
  });

  it('should show play button by default', () => {
    render(<RecordingCard recording={mockRecording} />);

    // Play icon should be visible
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should call onPlay when play button is clicked', () => {
    const onPlay = vi.fn();
    render(<RecordingCard recording={mockRecording} onPlay={onPlay} />);

    const playButton = screen.getAllByRole('button')[0];
    fireEvent.click(playButton);

    expect(onPlay).toHaveBeenCalled();
  });

  it('should call onPause when pause button is clicked while playing', () => {
    const onPause = vi.fn();
    render(<RecordingCard recording={mockRecording} isPlaying={true} onPause={onPause} />);

    const pauseButton = screen.getAllByRole('button')[0];
    fireEvent.click(pauseButton);

    expect(onPause).toHaveBeenCalled();
  });

  it('should call onClick when card is clicked', () => {
    const onClick = vi.fn();
    render(<RecordingCard recording={mockRecording} onClick={onClick} />);

    const card = screen.getByText('Test Recording').closest('div[class*="rounded-xl"]');
    fireEvent.click(card!);

    expect(onClick).toHaveBeenCalled();
  });

  it('should show delete confirmation on delete button click', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(<RecordingCard recording={mockRecording} onDelete={onDelete} />);

    // Find and click the delete button (trash icon)
    const buttons = screen.getAllByRole('button');
    // The delete button is the second button (after play button)
    const deleteButton = buttons[1];
    await user.click(deleteButton);

    // Confirmation buttons should appear
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should call onDelete when delete is confirmed', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(<RecordingCard recording={mockRecording} onDelete={onDelete} />);

    // Click delete button to show confirmation
    const buttons = screen.getAllByRole('button');
    await user.click(buttons[1]); // trash icon button

    // Click confirm delete
    const confirmButton = screen.getByText('Delete');
    await user.click(confirmButton);

    expect(onDelete).toHaveBeenCalled();
  });

  it('should cancel delete when cancel is clicked', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(<RecordingCard recording={mockRecording} onDelete={onDelete} />);

    // Click delete button to show confirmation
    const buttons = screen.getAllByRole('button');
    await user.click(buttons[1]); // trash icon button

    // Click cancel
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(onDelete).not.toHaveBeenCalled();
    // Confirmation should be hidden
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });

  it('should show analyzed badge when recording has analysis', () => {
    const analyzedRecording: Recording = {
      ...mockRecording,
      analysis: {
        clarityAndStructure: { score: 8, feedback: 'Good' },
        concisenessAndWordChoice: { score: 7, feedback: 'Good' },
        emotionalResonance: { score: 6, feedback: 'Good' },
        toneAndPresence: { score: 8, feedback: 'Good' },
        audienceConnection: { score: 7, feedback: 'Good' },
        improvements: ['Improve pacing'],
        overallScore: 7,
      },
    };

    render(<RecordingCard recording={analyzedRecording} />);

    expect(screen.getByText('Analyzed')).toBeInTheDocument();
  });
});
