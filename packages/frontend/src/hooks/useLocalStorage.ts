import { useState } from 'react';

export const useLocalStorage = <ValueType = never>(
  key: string,
  initialValue: ValueType,
): [ValueType, (value: ValueType) => void] => {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined' || key === null) {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: ValueType) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};
