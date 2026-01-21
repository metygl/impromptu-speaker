import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock IndexedDB
const indexedDB = {
  open: vi.fn(() => ({
    result: {
      createObjectStore: vi.fn(),
      objectStoreNames: { contains: vi.fn(() => false) },
      transaction: vi.fn(() => ({
        objectStore: vi.fn(() => ({
          put: vi.fn(),
          get: vi.fn(),
          delete: vi.fn(),
          openCursor: vi.fn(),
          clear: vi.fn(),
        })),
      })),
      close: vi.fn(),
    },
    onerror: null,
    onsuccess: null,
    onupgradeneeded: null,
  })),
};

Object.defineProperty(window, 'indexedDB', {
  value: indexedDB,
  writable: true,
});

// Mock MediaRecorder
class MockMediaRecorder {
  state = 'inactive';
  ondataavailable: ((event: any) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: ((event: any) => void) | null = null;

  constructor(public stream: MediaStream) {}

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    if (this.onstop) this.onstop();
  }

  pause() {
    this.state = 'paused';
  }

  resume() {
    this.state = 'recording';
  }

  static isTypeSupported() {
    return true;
  }
}

Object.defineProperty(window, 'MediaRecorder', {
  value: MockMediaRecorder,
  writable: true,
});

// Mock navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn(() =>
      Promise.resolve({
        getTracks: () => [{ stop: vi.fn() }],
      })
    ),
  },
  writable: true,
});

// Mock navigator.permissions
Object.defineProperty(navigator, 'permissions', {
  value: {
    query: vi.fn(() =>
      Promise.resolve({
        state: 'granted',
        onchange: null,
      })
    ),
  },
  writable: true,
});

// Mock URL.createObjectURL and revokeObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  value: vi.fn(() => 'blob:mock-url'),
  writable: true,
});

Object.defineProperty(URL, 'revokeObjectURL', {
  value: vi.fn(),
  writable: true,
});

// Mock crypto.randomUUID
Object.defineProperty(crypto, 'randomUUID', {
  value: vi.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9)),
  writable: true,
});

// Mock Audio
class MockAudio {
  src = '';
  currentTime = 0;
  duration = 60;
  paused = true;
  playbackRate = 1;
  preload = 'auto';

  onloadedmetadata: (() => void) | null = null;
  oncanplaythrough: (() => void) | null = null;
  onended: (() => void) | null = null;
  onerror: ((e: any) => void) | null = null;

  play() {
    this.paused = false;
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
  }

  load() {
    setTimeout(() => {
      if (this.onloadedmetadata) this.onloadedmetadata();
      if (this.oncanplaythrough) this.oncanplaythrough();
    }, 0);
  }
}

Object.defineProperty(window, 'Audio', {
  value: MockAudio,
  writable: true,
});
