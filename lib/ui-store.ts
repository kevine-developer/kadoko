import { useState, useEffect } from "react";

export type ToastType = "success" | "error" | "info";

export interface AlertAction {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
}

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

interface AlertModalState {
  visible: boolean;
  title: string;
  message: string;
  actions: AlertAction[];
}

interface UIStoreState {
  toast: ToastState;
  alertModal: AlertModalState;
}

let state: UIStoreState = {
  toast: { visible: false, message: "", type: "info" },
  alertModal: { visible: false, title: "", message: "", actions: [] },
};

const listeners = new Set<(state: UIStoreState) => void>();

export const uiStore = {
  getState: () => state,

  showToast: (message: string, type: ToastType = "info") => {
    state = { ...state, toast: { visible: true, message, type } };
    listeners.forEach((l) => l(state));

    // Auto dismiss after 3s
    setTimeout(() => {
      uiStore.hideToast();
    }, 3000);
  },

  hideToast: () => {
    state = { ...state, toast: { ...state.toast, visible: false } };
    listeners.forEach((l) => l(state));
  },

  showAlert: (title: string, message: string, actions: AlertAction[]) => {
    state = {
      ...state,
      alertModal: { visible: true, title, message, actions },
    };
    listeners.forEach((l) => l(state));
  },

  hideAlert: () => {
    state = { ...state, alertModal: { ...state.alertModal, visible: false } };
    listeners.forEach((l) => l(state));
  },

  subscribe: (listener: (state: UIStoreState) => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export const useUIStore = () => {
  const [uiState, setUiState] = useState(uiStore.getState());

  useEffect(() => {
    const unsubscribe = uiStore.subscribe(setUiState);
    return () => {
      unsubscribe();
    };
  }, []);

  return {
    ...uiState,
    showToast: uiStore.showToast,
    hideToast: uiStore.hideToast,
    showAlert: uiStore.showAlert,
    hideAlert: uiStore.hideAlert,
  };
};
