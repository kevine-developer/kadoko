import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

interface ProtectedRouteOptions {
  session: any;
  isLoading: boolean;
  isFirstLaunch: boolean;
  isNavigationReady: boolean;
}

/**
 * Hook de protection des routes (Best Practice Expo Router)
 * Gère les redirections globales vers Onboarding, Auth ou App (Tabs)
 */
export const useProtectedRoute = ({
  session,
  isLoading,
  isFirstLaunch,
  isNavigationReady,
}: ProtectedRouteOptions) => {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // 1. Attendre que la session charge et que la navigation soit prête
    if (isLoading || !isNavigationReady) return;

    // 2. Extraire les segments pour identifier la position actuelle
    if ((segments as string[]).length === 0) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "(onboarding)";

    // Protection spécifique : ne pas éjecter de verify-email
    const onVerifyEmail = segments[1] === "verify-email";

    // 3. Protection Verify Email (Exception prioritaire pour éviter les boucles)
    if (onVerifyEmail && inAuthGroup) {
      return;
    }

    // 4. Logique de redirection vers l'Onboarding (Premier lancement)
    if (isFirstLaunch && !inOnboarding) {
      router.replace("/(onboarding)");
      return;
    }

    // Sortir de l'onboarding s'il a déjà été complété
    if (!isFirstLaunch && inOnboarding) {
      router.replace(session ? "/(tabs)" : "/(auth)/sign-in");
      return;
    }

    // 5. Redirection vers Auth si pas de session et pas dans le groupe auth
    if (!session && !inAuthGroup && !inOnboarding) {
      router.replace("/(auth)/sign-in");
      return;
    }

    // 6. Redirection vers App si session présente et dans le groupe auth ou onboarding
    if (session && (inAuthGroup || inOnboarding)) {
      router.replace("/(tabs)");
      return;
    }
  }, [session, isFirstLaunch, isLoading, isNavigationReady, segments, router]);
};
