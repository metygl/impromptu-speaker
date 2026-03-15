'use client';

import { useCallback, useRef, useSyncExternalStore } from 'react';

const LOCAL_STORAGE_CHANGE_EVENT = 'impromptu-speaker:local-storage-change';
const subscribeToHydration = () => () => undefined;
const snapshotCache = new Map<string, { rawValue: string | null; parsedValue: unknown }>();

function readLocalStorageValue<T>(key: string, initialValue: T) {
  if (typeof window === 'undefined') {
    return initialValue;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    const cachedSnapshot = snapshotCache.get(key);

    if (cachedSnapshot && cachedSnapshot.rawValue === rawValue) {
      return cachedSnapshot.parsedValue as T;
    }

    const parsedValue = rawValue ? (JSON.parse(rawValue) as T) : initialValue;
    snapshotCache.set(key, {
      rawValue,
      parsedValue,
    });
    return parsedValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return initialValue;
  }
}

function dispatchLocalStorageChange(key: string) {
  window.dispatchEvent(
    new CustomEvent<{ key: string }>(LOCAL_STORAGE_CHANGE_EVENT, {
      detail: { key },
    })
  );
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const initialValueRef = useRef(initialValue);

  const storedValue = useSyncExternalStore(
    useCallback(
      (callback) => {
        if (typeof window === 'undefined') {
          return () => undefined;
        }

        const handleStorage = (event: StorageEvent) => {
          if (event.key === key) {
            callback();
          }
        };
        const handleLocalChange = (event: Event) => {
          const customEvent = event as CustomEvent<{ key: string }>;
          if (customEvent.detail?.key === key) {
            callback();
          }
        };

        window.addEventListener('storage', handleStorage);
        window.addEventListener(LOCAL_STORAGE_CHANGE_EVENT, handleLocalChange as EventListener);

        return () => {
          window.removeEventListener('storage', handleStorage);
          window.removeEventListener(
            LOCAL_STORAGE_CHANGE_EVENT,
            handleLocalChange as EventListener
          );
        };
      },
      [key]
    ),
    () => readLocalStorageValue(key, initialValueRef.current),
    () => initialValueRef.current
  );
  const isHydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      if (typeof window === 'undefined') {
        return;
      }

      try {
        const previousValue = readLocalStorageValue(key, initialValueRef.current);
        const valueToStore = value instanceof Function ? value(previousValue) : value;

        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        dispatchLocalStorageChange(key);
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  return [storedValue, setValue, isHydrated];
}
