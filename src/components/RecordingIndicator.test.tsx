import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecordingIndicator } from './RecordingIndicator';

describe('RecordingIndicator', () => {
  it('should not render when not recording', () => {
    const { container } = render(
      <RecordingIndicator duration={0} isRecording={false} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when recording', () => {
    render(<RecordingIndicator duration={0} isRecording={true} />);

    expect(screen.getByText('0:00')).toBeInTheDocument();
  });

  it('should display formatted duration', () => {
    render(<RecordingIndicator duration={125} isRecording={true} />);

    expect(screen.getByText('2:05')).toBeInTheDocument();
  });

  it('should display hours correctly', () => {
    render(<RecordingIndicator duration={3661} isRecording={true} />);

    // 3661 seconds = 61 minutes and 1 second = 61:01
    expect(screen.getByText('61:01')).toBeInTheDocument();
  });

  it('should show paused indicator when paused', () => {
    render(<RecordingIndicator duration={60} isRecording={true} isPaused={true} />);

    expect(screen.getByText('Paused')).toBeInTheDocument();
  });

  it('should not show paused indicator when not paused', () => {
    render(<RecordingIndicator duration={60} isRecording={true} isPaused={false} />);

    expect(screen.queryByText('Paused')).not.toBeInTheDocument();
  });

  it('should have pulsing animation when recording and not paused', () => {
    const { container } = render(
      <RecordingIndicator duration={60} isRecording={true} isPaused={false} />
    );

    // Check for animate-ping class on the pulsing element
    const pulsingElement = container.querySelector('.animate-ping');
    expect(pulsingElement).toBeInTheDocument();
  });

  it('should not have pulsing animation when paused', () => {
    const { container } = render(
      <RecordingIndicator duration={60} isRecording={true} isPaused={true} />
    );

    // The pulsing element should not have animate-ping class when paused
    const pulsingElement = container.querySelector('.animate-ping');
    expect(pulsingElement).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <RecordingIndicator
        duration={60}
        isRecording={true}
        className="custom-class"
      />
    );

    const element = container.firstChild as HTMLElement;
    expect(element.classList.contains('custom-class')).toBe(true);
  });
});
