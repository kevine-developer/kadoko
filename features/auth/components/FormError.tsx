import React from "react";
import { StyleSheet, Text, View, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";

// --- THEME ÉDITORIAL COHÉRENT ---
const THEME = {
  textMain: "#1A1A1A",
  accent: "#AF9062", // Or brossé
  error: "#C34A4A", // Rouge brique profond (Luxe)
  errorBg: "#FFF9F9", // Fond rosé extrêmement pâle
  border: "rgba(195, 74, 74, 0.1)",
};

interface FormErrorProps {
  message?: string | null;
}

export const FormError = ({ message }: FormErrorProps) => {
  if (!message) return null;

  return (
    <MotiView 
      from={{ opacity: 0, translateY: -10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400 }}
      style={styles.container}
    >
      <View style={styles.errorIndicator} />
      
      <View style={styles.content}>
        <Ionicons name="information-circle-outline" size={16} color={THEME.error} />
        <Text style={styles.text}>{message}</Text>
      </View>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: THEME.errorBg,
    marginBottom: 25,
    // Pas de border radius complet pour le look "Éditorial"
    borderRadius: 0, 
    borderWidth: 1,
    borderColor: THEME.border,
    overflow: "hidden",
  },
  errorIndicator: {
    width: 3,
    backgroundColor: THEME.error,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    gap: 10,
    flex: 1,
  },
  text: {
    color: THEME.error,
    fontSize: 13,
    fontWeight: "500",
    // Utilisation du Serif pour un aspect "Note de bas de page"
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontStyle: "italic",
    lineHeight: 18,
  },
});