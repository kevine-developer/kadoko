import { Platform, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

const THEME = {
  textSecondary: "#8E8E93",
  accent: "#AF9062",
  background: "#FDFBF7",
};

const EmptyListTab = ({ title, icon }: any) => {
  return (
    <View style={styles.emptyState}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={28} color={THEME.accent} />
      </View>
      <Text style={styles.emptyText}>{title}</Text>
      <View style={styles.decorativeLine} />
    </View>
  );
};

export default EmptyListTab;

const styles = StyleSheet.create({
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(175, 144, 98, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyText: {
    color: THEME.textSecondary,
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 22,
  },
  decorativeLine: {
    width: 30,
    height: 1,
    backgroundColor: THEME.accent,
    marginTop: 20,
    opacity: 0.4,
  },
});