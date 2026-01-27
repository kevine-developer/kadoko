import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import {
  Stack,
  useRouter,
  useSegments,
  useRootNavigationState,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { View } from "react-native";
import { Loader } from "@/components/ui/Loader";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSession } from "@/features/auth";
import { useIsFirstLaunch } from "@/hooks/use-is-first-launch";
import OfflineModal from "@/components/Network/OfflineModal";
import ServerErrorModal from "@/components/Network/ServerErrorModal";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Toast } from "@/components/ui/Toast";
import { AlertModal } from "@/components/ui/AlertModal";
import { useUIStore } from "@/lib/ui-store";
import { AnimatePresence } from "moti";

export default function RootLayout() {
  usePushNotifications();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  const { toast, alertModal, hideAlert } = useUIStore();

  const { session, isLoading: isSessionLoading } = useSession();
  const { isFirstLaunch, isLoading: isFirstLaunchLoading } = useIsFirstLaunch();

  const isLoading = isSessionLoading || isFirstLaunchLoading;

  const navigationState = useRootNavigationState();
  const isNavigationReady = navigationState?.key;

  useEffect(() => {
    if (isLoading || !isNavigationReady) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "(onboarding)";

    if (isFirstLaunch && !inOnboarding) {
      router.replace("/(onboarding)");
    } else if (!isFirstLaunch && !session && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    } else if (session && (inAuthGroup || inOnboarding)) {
      router.replace("/(tabs)");
    }
  }, [session, isFirstLaunch, isLoading, isNavigationReady, segments, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FFF" }}>
        <Loader size="large" />
      </View>
    );
  }

  // Calculer l'écran initial pour éviter le flash de l'onboarding
  let initialRouteName: string = "(onboarding)";
  if (!isFirstLaunch) {
    initialRouteName = session ? "(tabs)" : "(auth)";
  }

  return (
    <ThemeProvider value={colorScheme === "light" ? DefaultTheme : DarkTheme}>
      <Stack
        screenOptions={{ headerShown: false }}
        initialRouteName={initialRouteName as any}
      >
        <Stack.Screen name="(onboarding)/index" />
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
