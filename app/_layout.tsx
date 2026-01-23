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
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSession } from "@/features/auth";
import { useIsFirstLaunch } from "@/hooks/use-is-first-launch";
import OfflineModal from "@/components/Network/OfflineModal";
import ServerErrorModal from "@/components/Network/ServerErrorModal";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export default function RootLayout() {
  usePushNotifications();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  const { session, isLoading: isSessionLoading } = useSession();
  const { isFirstLaunch, isLoading: isFirstLaunchLoading } = useIsFirstLaunch();

  const isLoading = isSessionLoading || isFirstLaunchLoading;

  const navigationState = useRootNavigationState();
  const isNavigationReady = navigationState?.key;

  useEffect(() => {
    if (isLoading || !isNavigationReady) return;

    // Utiliser un petit timeout pour s'assurer que le navigateur est stable
    const timer = setTimeout(() => {
      const inAuthGroup = segments[0] === "(auth)";
      const inOnboarding = segments[0] === "(onboarding)";

      if (isFirstLaunch && !inOnboarding) {
        router.replace("/(onboarding)");
      } else if (!isFirstLaunch && !session && !inAuthGroup) {
        router.replace("/(auth)/sign-in");
      } else if (session && (inAuthGroup || inOnboarding)) {
        router.replace("/(tabs)");
      }
    }, 1);

    return () => clearTimeout(timer);
  }, [session, isFirstLaunch, isLoading, isNavigationReady, segments, router]);

  if (isLoading) {
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
    </ThemeProvider>
  );
}
