import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { serverErrorStore } from "@/hooks/useServerError";

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  fetchOptions: {
    onError: (context) => {
      // Intercepter les erreurs 500 (Serveur / BDD)
      if (context.response.status >= 500) {
        serverErrorStore.setError(true);
      }
    },
  },
  plugins: [
    expoClient({
      scheme: "kadokou",
      storagePrefix: "withbetterauth",
      storage: SecureStore,
    }),
  ],
});
