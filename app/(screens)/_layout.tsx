import { Stack } from "expo-router";

export default function ScreenLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Détail d’un cadeau */}
        <Stack.Screen name="profilFriend" />
        <Stack.Screen name="gifts" />
      </Stack>
    </>
  );
}
