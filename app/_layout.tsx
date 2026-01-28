import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRootNavigationState } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSession, useProtectedRoute } from "@/features/auth";
import { useIsFirstLaunch } from "@/hooks/use-is-first-launch";
import { useDeepLinking } from "@/hooks/useDeepLinking";
import OfflineModal from "@/components/Network/OfflineModal";
import ServerErrorModal from "@/components/Network/ServerErrorModal";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Toast } from "@/components/ui/Toast";
import { AlertModal } from "@/components/ui/AlertModal";
import { useUIStore } from "@/lib/ui-store";
import { AnimatePresence } from "moti";

export default function RootLayout() {
  usePushNotifications();
  useDeepLinking();
  const colorScheme = useColorScheme();

  const { toast, alertModal, hideAlert } = useUIStore();

  const { session, isLoading: isSessionLoading } = useSession();
  const { isFirstLaunch, isLoading: isFirstLaunchLoading } = useIsFirstLaunch();

  const isLoading = isSessionLoading || isFirstLaunchLoading;
  const navigationState = useRootNavigationState();
  const isNavigationReady = !!navigationState?.key;

  const [hasLoadedOnce, setHasLoadedOnce] = React.useState(false);

  React.useEffect(() => {
    if (!isLoading && isNavigationReady) {
      setHasLoadedOnce(true);
    }
  }, [isLoading, isNavigationReady]);

  // Gestion centralisée des redirections (Auth, Onboarding, Protected Routes)
  useProtectedRoute({
    session,
    isLoading,
    isFirstLaunch,
    isNavigationReady,
  });

  if (!hasLoadedOnce && isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "light" ? DefaultTheme : DarkTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(screens)" />
        <Stack.Screen name="(auth)" />
        {/*  <Stack.Screen name="user" /> */}
      </Stack>

      <StatusBar style="auto" />
      <OfflineModal />
      <ServerErrorModal />

      <AnimatePresence>
        {toast.visible && (
          <Toast
            visible={toast.visible}
            message={toast.message}
            type={toast.type}
          />
        )}
      </AnimatePresence>

      <AlertModal
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        actions={alertModal.actions.map((action) => ({
          ...action,
          onPress: () => {
            action.onPress?.();
            hideAlert();
          },
        }))}
        onClose={hideAlert}
      />
    </ThemeProvider>
  );
}
