import {
  Dimensions,
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

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
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
  /* --- FORM SHEET STYLE "BOUTIQUE" --- */
  formSheet: {
    backgroundColor: THEME.background,
    // Suppression des arrondis massifs pour un look rectangulaire plus prestigieux
    borderRadius: 0,
    paddingHorizontal: 32, // Marges plus larges style magazine
    paddingTop: 5,
    minHeight: SCREEN_HEIGHT * 0.6, // Prend 60% de l'écran par défaut
    // Ombre de contact ultra-subtile
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
  },

});
