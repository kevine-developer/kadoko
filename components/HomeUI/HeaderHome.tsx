import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HeaderHome = ({ user }: any) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
      <View>
        <Text style={styles.headerDate}>
          {new Date()
            .toLocaleDateString("fr-FR", { weekday: "long", day: "numeric" })
            .toUpperCase()}
        </Text>
        <Text style={styles.headerTitle}>
          Gift<Text style={styles.headerTitleItalic}>Flow</Text>
        </Text>
      </View>
      <TouchableOpacity
        style={styles.headerAvatarBtn}
        onPress={() => router.push("/(screens)/notificationsScreen")}
      >
        <View style={styles.notificationCircle}>
          <Ionicons name="notifications-outline" size={24} color="#111827" />
          <View style={styles.notificationBadge} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default HeaderHome;

const styles = StyleSheet.create({
  /* HEADER STYLE */
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: "#FDFBF7",
  },
  headerDate: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "300", // Light pour un look éditorial
    color: "#111827",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif", // Typographie Serif
    letterSpacing: -0.5,
  },
  headerTitleItalic: {
    fontStyle: "italic",
    fontWeight: "500",
  },
  headerAvatarBtn: {
    position: "relative",
  },
  notificationCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  notificationBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: "#FFF",
  },
});
