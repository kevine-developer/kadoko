import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSession } from "@/features/auth";
import { useIsFirstLaunch } from "@/hooks/use-is-first-launch";
import OfflineModal from "@/components/Network/OfflineModal";
import ServerErrorModal from "@/components/Network/ServerErrorModal";

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  const { session, isLoading: isSessionLoading } = useSession();
  const { isFirstLaunch, isLoading: isFirstLaunchLoading } = useIsFirstLaunch();

  const isLoading = isSessionLoading || isFirstLaunchLoading;

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "(onboarding)";

    if (isFirstLaunch && !inOnboarding) {
      // Rediriger vers l'onboarding si premier lancement
      router.replace("/(onboarding)");
    } else if (!isFirstLaunch && !session && !inAuthGroup) {
      // Rediriger vers login si non connecté et pas déjà dans auth
      router.replace("/(auth)/sign-in");
    } else if (session && (inAuthGroup || inOnboarding)) {
      // Rediriger vers l'app si connecté et dans auth/onboarding
      router.replace("/(tabs)");
    }
  }, [session, isFirstLaunch, isLoading, segments, router]);

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
