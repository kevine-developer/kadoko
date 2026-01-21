import { useState, useEffect } from "react";

// Store simple pour l'état d'erreur serveur
let hasError = false;
const listeners = new Set<(error: boolean) => void>();

export const serverErrorStore = {
  setError: (value: boolean) => {
    hasError = value;
    listeners.forEach((listener) => listener(hasError));
  },
  getError: () => hasError,
  subscribe: (listener: (error: boolean) => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export const useServerError = () => {
  const [error, setError] = useState(serverErrorStore.getError());

  useEffect(() => {
    const unsubscribe = serverErrorStore.subscribe(setError);
    return () => {
      unsubscribe();
    };
  }, []);

  return {
    hasServerError: error,
    setServerError: serverErrorStore.setError,
  };
};
