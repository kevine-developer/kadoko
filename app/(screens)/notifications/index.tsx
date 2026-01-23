import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Stack, useRouter } from "expo-router";
import { NotificationList } from "@/components/notifications/NotificationList";
import { useNotifications } from "@/hooks/useNotifications";

export default function NotificationsScreen() {
  const { markAllAsRead } = useNotifications();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Notifications",
          headerRight: () => (
            <TouchableOpacity
              onPress={markAllAsRead}
              style={{ marginRight: 16 }}
            >
              <Text style={styles.readAllText}>Tout lire</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <NotificationList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  readAllText: {
    color: "#007AFF",
    fontSize: 16,
  },
});
