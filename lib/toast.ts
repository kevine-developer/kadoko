import { Alert, Platform } from "react-native";

/**
 * Affiche un message de succès à l'utilisateur
 */
export function showSuccessToast(message: string, title = "Succès") {
  if (Platform.OS === "web") {
    alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message, [{ text: "OK" }]);
  }
}

/**
 * Affiche un message d'erreur à l'utilisateur
 */
export function showErrorToast(message: string, title = "Erreur") {
  if (Platform.OS === "web") {
    alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message, [{ text: "OK" }]);
  }
}

/**
 * Affiche un message d'information à l'utilisateur
 */
export function showInfoToast(message: string, title = "Information") {
  if (Platform.OS === "web") {
    alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message, [{ text: "OK" }]);
  }
}
