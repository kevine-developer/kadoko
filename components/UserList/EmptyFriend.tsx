import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
// --- THEME LUXE ---
const THEME = {
  background: "#FDFBF7",
  surface: "#FFFFFF",
  textMain: "#111827",
  textSecondary: "#6B7280",
  accent: "#111827",
  border: "rgba(0,0,0,0.06)",
  success: "#10B981",
};

interface EmptyFriendProps {
  onPress?: () => void;
}

const EmptyFriend = ({ onPress }: EmptyFriendProps) => {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={40} color="#D1D5DB" />
      <Text style={styles.emptyText}>Votre cercle est encore vide.</Text>
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.linkText}>Inviter des amis</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EmptyFriend;

const styles = StyleSheet.create({
  /* EMPTY STATES */
  emptyState: {
    alignItems: "center",
    marginTop: 40,
    gap: 12,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 15,
    fontStyle: "italic",
  },
  linkText: {
    color: THEME.textMain,
    fontSize: 14,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
