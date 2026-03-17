import { Dispatch, SetStateAction, useEffect, useState } from "react";

type ParseStoredValue<T> = (value: unknown) => T;

function readStoredValue<T>(
  key: string,
  initialValue: T,
  parseStoredValue?: ParseStoredValue<T>
): T {
  if (typeof window === "undefined") {
    return initialValue;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) {
      return initialValue;
    }

    const parsedValue = JSON.parse(rawValue) as unknown;
    return parseStoredValue ? parseStoredValue(parsedValue) : (parsedValue as T);
  } catch {
    return initialValue;
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  parseStoredValue?: ParseStoredValue<T>
): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() =>
    readStoredValue(key, initialValue, parseStoredValue)
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(key, JSON.stringify(storedValue));
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
