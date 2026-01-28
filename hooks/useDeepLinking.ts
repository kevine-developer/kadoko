import { useEffect, useCallback } from "react";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useUIStore } from "@/lib/ui-store";

/**
 * Hook pour gérer les deep links entrants dans l'application.
 * Supporte actuellement :
 * - kadokou://verify-success : Redirection après validation de l'email
 */
export function useDeepLinking() {
  const router = useRouter();
  const { showToast } = useUIStore();

  const handleDeepLink = useCallback(
    (url: string) => {
      const parsed = Linking.parse(url);
      const { path } = parsed;

      if (path === "verify-success") {
        // Afficher un toast de succès
        showToast("Votre email a été vérifié avec succès !", "success");

        // Rediriger vers l'écran de connexion
        router.replace("/(auth)/sign-in");
      }
    },
    [router, showToast],
  );

  useEffect(() => {
    // 1. Gérer l'URL qui a ouvert l'application (Deep Link à froid)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // 2. Écouter les nouveaux URLs entrants (Deep Link à chaud)
    const subscription = Linking.addEventListener("url", (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, [handleDeepLink]);
}
