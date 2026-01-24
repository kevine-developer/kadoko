import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { serverErrorStore } from "@/hooks/useServerError";
import { emailOTPClient } from "better-auth/client/plugins";

// En développement avec Expo Go, le scheme est "exp"
// En production (build natif), le scheme est "wishly"
/* const isExpoGo = Constants.appOwnership === "expo";
const APP_SCHEME = isExpoGo ? "exp" : "wishly";

 */

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000",
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
      scheme: "wishly",
      storagePrefix: "withbetterauth",
      storage: SecureStore,
    }),
    emailOTPClient(),
  ],
});
