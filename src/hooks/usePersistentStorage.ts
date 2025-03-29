
import { useState, useEffect } from 'react';

export function usePersistentStorage<T>(
  key: string, 
  initialValue: T, 
  storage: Storage = localStorage
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from storage by key
      const item = storage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.error(`Error reading from ${key}:`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to storage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to storage
      storage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error writing to ${key}:`, error);
    }
  };

  // Function to clear the stored data
  const clearValue = () => {
    try {
      storage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error clearing ${key}:`, error);
    }
  };

  // Listen for changes in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing storage change for ${key}:`, error);
        }
      } else if (e.key === key && e.newValue === null) {
        // Item was removed
        setStoredValue(initialValue);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]);

  return [storedValue, setValue, clearValue];
}
