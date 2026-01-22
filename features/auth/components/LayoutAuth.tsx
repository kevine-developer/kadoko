import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import React from "react";
import ImageHeader from "./ImageHeader";
import { StatusBar } from "expo-status-bar";

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
const LayoutAuth = ({ children }: { children: React.ReactNode }) => {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* 1. IMAGE D'ACCUEIL IMMERSIVE */}
      <ImageHeader />

      {/* 2. FORMULAIRE FLOTTANT (Bottom Sheet Style) */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.formSheet}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LayoutAuth;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background, // Fond noir derrière l'image
  },
  /* --- FORM SHEET --- */
  formSheet: {
    backgroundColor: THEME.background, // Blanc cassé
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 40,
    minHeight: "50%",
  },
});
