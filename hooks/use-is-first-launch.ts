import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";

const KEY_IS_FIRST_LAUNCH = "isFirstLaunch";

// --- GESTIONNAIRE D'ÉTAT SINGLETON ---
type Listener = (value: boolean) => void;
class FirstLaunchStore {
  private static instance: FirstLaunchStore;
  private isFirstLaunch: boolean = false;
  private isLoading: boolean = true;
  private listeners: Set<Listener> = new Set();
  private isInitialized: boolean = false;

  private constructor() {
    this.init();
  }

  static getInstance() {
    if (!FirstLaunchStore.instance) {
      FirstLaunchStore.instance = new FirstLaunchStore();
    }
    return FirstLaunchStore.instance;
  }

  private async init() {
    try {
      const value = await SecureStore.getItemAsync(KEY_IS_FIRST_LAUNCH);
      this.isFirstLaunch = value === null;
    } catch (error) {
      console.error("Error checking first launch:", error);
      this.isFirstLaunch = false;
    } finally {
      this.isLoading = false;
      this.isInitialized = true;
      this.notify();
    }
  }

  getState() {
    return { isFirstLaunch: this.isFirstLaunch, isLoading: this.isLoading };
  }

  async setHasLaunched() {
    try {
      await SecureStore.setItemAsync(KEY_IS_FIRST_LAUNCH, "false");
      this.isFirstLaunch = false;
      this.notify();
    } catch (error) {
      console.error("Error setting first launch:", error);
    }
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l(this.isFirstLaunch));
  }
}

const store = FirstLaunchStore.getInstance();

export function useIsFirstLaunch() {
  const [state, setState] = useState(store.getState());

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setState(store.getState());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return {
    isFirstLaunch: state.isFirstLaunch,
    isLoading: state.isLoading,
    setHasLaunched: () => store.setHasLaunched(),
  };
}
