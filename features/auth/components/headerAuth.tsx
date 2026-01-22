import { Platform, StyleSheet, Text, View } from "react-native";
import React from "react";
// --- THEME LUXE ---
const THEME = {
  background: "#FDFBF7", // Blanc cassé "Bone"
  surface: "#FFFFFF",
  textMain: "#111827", // Noir profond
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  primary: "#111827",
  inputBg: "#FFFFFF",
};

interface HeaderAuthProps {
  title: string;
  subtitle: string;
}

const HeaderAuth = ({ title, subtitle }: HeaderAuthProps) => {
  return (
    <View style={styles.headerTextContainer}>
      <Text style={styles.welcomeSubtitle}>{subtitle}</Text>
      <Text style={styles.welcomeTitle}>{title}</Text>
    </View>
  );
};

export default HeaderAuth;

const styles = StyleSheet.create({
  /* --- TYPOGRAPHY --- */
  headerTextContainer: {
    marginBottom: 32,
  },
  welcomeSubtitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 2,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  welcomeTitle: {
    fontSize: 36,
    color: THEME.textMain,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    letterSpacing: -0.5,
  },
});
