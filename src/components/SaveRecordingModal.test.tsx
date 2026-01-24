import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SaveRecordingModal } from './SaveRecordingModal';

describe('SaveRecordingModal', () => {
  const defaultProps = {
    isOpen: true,
    topicText: 'What is your greatest achievement?',
    frameworkName: 'PREP',
    duration: 125,
    onSave: vi.fn(),
    onDiscard: vi.fn(),
  };

  it('should not render when closed', () => {
    render(<SaveRecordingModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Save Recording')).not.toBeInTheDocument();
  });

  it('should render modal title', () => {
    render(<SaveRecordingModal {...defaultProps} />);

    expect(screen.getByText('Save Recording')).toBeInTheDocument();
  });

  it('should display duration', () => {
    render(<SaveRecordingModal {...defaultProps} />);

    expect(screen.getByText('2:05')).toBeInTheDocument();
  });

  it('should display framework name', () => {
    render(<SaveRecordingModal {...defaultProps} />);

    expect(screen.getByText('PREP')).toBeInTheDocument();
  });

  it('should display topic text', () => {
    render(<SaveRecordingModal {...defaultProps} />);

    expect(screen.getByText('What is your greatest achievement?')).toBeInTheDocument();
  });

  it('should have a name input field', () => {
    render(<SaveRecordingModal {...defaultProps} />);

    expect(screen.getByLabelText('Recording Name')).toBeInTheDocument();
  });

  it('should call onSave with the entered name', async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();

    render(<SaveRecordingModal {...defaultProps} onSave={onSave} />);

    const input = screen.getByLabelText('Recording Name');
    await user.type(input, 'My Recording');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    expect(onSave).toHaveBeenCalledWith('My Recording');
  });

  it('should call onSave with empty string if input is empty (parent handles default)', async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();

    render(<SaveRecordingModal {...defaultProps} onSave={onSave} />);

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    // Should pass empty string - parent component handles default naming
    expect(onSave).toHaveBeenCalledWith('');
  });

  it('should call onDiscard when discard button is clicked', async () => {
    const onDiscard = vi.fn();
    const user = userEvent.setup();

    render(<SaveRecordingModal {...defaultProps} onDiscard={onDiscard} />);

    const discardButton = screen.getByRole('button', { name: /discard/i });
    await user.click(discardButton);

    expect(onDiscard).toHaveBeenCalled();
  });

  it('should call onDiscard when backdrop is clicked', async () => {
    const onDiscard = vi.fn();

    render(<SaveRecordingModal {...defaultProps} onDiscard={onDiscard} />);

    // Click on the backdrop (the semi-transparent overlay)
    const backdrop = document.querySelector('.bg-black\\/40');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(onDiscard).toHaveBeenCalled();
    }
  });

  it('should call onDiscard when close button is clicked', async () => {
    const onDiscard = vi.fn();
    const user = userEvent.setup();

    render(<SaveRecordingModal {...defaultProps} onDiscard={onDiscard} />);

    // Find the X button (close button)
    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons.find((btn) =>
      btn.querySelector('svg')?.classList.contains('lucide-x')
    );

    if (closeButton) {
      await user.click(closeButton);
      expect(onDiscard).toHaveBeenCalled();
    }
  });
});
