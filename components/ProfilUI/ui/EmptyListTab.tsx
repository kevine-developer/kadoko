import { Platform, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

interface EmptyListTabProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const EmptyListTab = ({ title, icon }: EmptyListTabProps) => {
  return (
    <View style={styles.emptyState}>
      <Ionicons name={icon} size={40} color="#D1D5DB" />
      <Text style={styles.emptyText}>{title}</Text>
    </View>
  );
};

export default EmptyListTab;

const styles = StyleSheet.create({
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 16,
    opacity: 0.7,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 15,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontStyle: "italic",
  },
});
