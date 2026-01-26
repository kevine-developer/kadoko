import { uiStore } from "./ui-store";

/**
 * Affiche un message de succès à l'utilisateur
 */
export function showSuccessToast(message: string) {
  uiStore.showToast(message, "success");
}

/**
 * Affiche un message d'erreur à l'utilisateur
 */
export function showErrorToast(message: string) {
  uiStore.showToast(message, "error");
}

/**
 * Affiche un message d'information à l'utilisateur
 */
export function showInfoToast(message: string) {
  uiStore.showToast(message, "info");
}

/**
 * Affiche un modal de confirmation ou d'alerte (remplace Alert.alert)
 */
export function showCustomAlert(
  title: string,
  message: string,
  actions: any[],
) {
  uiStore.showAlert(title, message, actions);
}
