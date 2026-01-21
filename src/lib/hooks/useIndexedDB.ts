'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const DB_NAME = 'impromptu-speaker';
const DB_VERSION = 1;

interface UseIndexedDBOptions {
  storeName: string;
}

interface UseIndexedDBReturn<T> {
  isReady: boolean;
  error: string | null;
  put: (key: string, value: T) => Promise<void>;
  get: (key: string) => Promise<T | undefined>;
  delete: (key: string) => Promise<void>;
  getAll: () => Promise<Array<{ key: string; value: T }>>;
  clear: () => Promise<void>;
}

export function useIndexedDB<T>({ storeName }: UseIndexedDBOptions): UseIndexedDBReturn<T> {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dbRef = useRef<IDBDatabase | null>(null);

  // Initialize the database
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      setError('Failed to open IndexedDB');
      console.error('IndexedDB error:', request.error);
    };

    request.onsuccess = () => {
      dbRef.current = request.result;
      setIsReady(true);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create the recordings store if it doesn't exist
      if (!db.objectStoreNames.contains('recordings')) {
        db.createObjectStore('recordings');
      }
    };

    return () => {
      dbRef.current?.close();
    };
  }, []);

  const put = useCallback(async (key: string, value: T): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!dbRef.current) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = dbRef.current.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(value, key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }, [storeName]);

  const get = useCallback(async (key: string): Promise<T | undefined> => {
    // Wait for database to be ready
    if (!dbRef.current) {
      // Give it a moment to initialize
      await new Promise(resolve => setTimeout(resolve, 100));
      if (!dbRef.current) {
        console.warn('Database not yet initialized, returning undefined');
        return undefined;
      }
    }

    return new Promise((resolve, reject) => {
      const transaction = dbRef.current!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [storeName]);

  const deleteItem = useCallback(async (key: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!dbRef.current) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = dbRef.current.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }, [storeName]);

  const getAll = useCallback(async (): Promise<Array<{ key: string; value: T }>> => {
    return new Promise((resolve, reject) => {
      if (!dbRef.current) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = dbRef.current.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.openCursor();
      const results: Array<{ key: string; value: T }> = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          results.push({ key: cursor.key as string, value: cursor.value });
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }, [storeName]);

  const clear = useCallback(async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!dbRef.current) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = dbRef.current.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }, [storeName]);

  return {
    isReady,
    error,
    put,
    get,
    delete: deleteItem,
    getAll,
    clear,
  };
}
