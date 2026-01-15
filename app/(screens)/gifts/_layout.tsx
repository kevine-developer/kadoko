import { Stack } from "expo-router";

export default function GiftsLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Détail d’un cadeau */}
        <Stack.Screen
          name="[giftId]"
          options={{
            title: "Détail du cadeau",
          }}
        />

        {/* Liste d’un groupe de cadeaux */}
        <Stack.Screen
          name="wishlists/[wishlistId]"
          options={{
            title: "Liste des cadeaux",
          }}
        />
      </Stack>
    </>
  );
}
