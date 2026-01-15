import { Stack } from "expo-router";

export default function GiftsLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Détail d’un cadeau */}
        <Stack.Screen name="[friendId]" />
      </Stack>
    </>
  );
}
