import { Platform, StyleSheet, Text, View } from "react-native";
import React from "react";
import { MotiView } from "moti";

// --- THEME ÉDITORIAL COHÉRENT ---
const THEME = {
  background: "#FDFBF7", // Bone Silk
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062", // Or brossé
};

interface HeaderAuthProps {
  title: string;
  subtitle: string;
}

const HeaderAuth = ({ title, subtitle }: HeaderAuthProps) => {
  return (
    <View style={styles.container}>
      {/* Petit diviseur or brossé pour introduire l'écran */}
      <MotiView
        from={{ width: 0, opacity: 0 }}
        animate={{ width: 35, opacity: 1 }}
        transition={{ type: "timing", duration: 800, delay: 200 }}
        style={styles.topDivider}
      />

      {/* Label style "Maison de couture" */}
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 600 }}
      >
        <Text style={styles.label}>{subtitle.toUpperCase()}</Text>
      </MotiView>

      {/* Titre Serif Imposant */}
      <MotiView
        from={{ opacity: 0, translateY: 15 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 700, delay: 100 }}
      >
        <Text style={styles.title}>{title}</Text>
      </MotiView>
    </View>
  );
};

export default HeaderAuth;

const styles = StyleSheet.create({
  container: {
    marginBottom: 45, // Plus d'espace pour laisser respirer le formulaire
    marginTop: 20,
  },
  topDivider: {
    height: 2,
    backgroundColor: THEME.accent,
    marginBottom: 20,
  },
  label: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 2, // Espacement luxueux
    marginBottom: 12,
  },
  title: {
    fontSize: 40, // Très grand pour l'impact visuel
    color: THEME.textMain,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    lineHeight: 46,
    letterSpacing: -1, // Resserré pour le style éditorial
  },
});
