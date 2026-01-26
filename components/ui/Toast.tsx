import React, { useEffect } from "react";
import { StyleSheet, View, Platform, Text } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// --- THEME ÉDITORIAL COHÉRENT ---
const THEME = {
  background: "#1A1A1A", // Noir profond Luxe
  textMain: "#FDFBF7", // Bone Silk
  accent: "#AF9062", // Or brossé
  error: "#C34A4A", // Rouge brique
  success: "#4A6741", // Vert forêt luxe
  border: "rgba(255,255,255,0.1)",
};

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
}

export const Toast = ({ visible, message, type = "info" }: ToastProps) => {
  const insets = useSafeAreaInsets();

  // Déclenchement haptique à l'apparition
  useEffect(() => {
    if (visible) {
      if (type === "error") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  }, [visible, type]);

  const getAccentColor = () => {
    switch (type) {
      case "success":
        return THEME.accent; // L'or pour le succès est plus luxe que le vert
      case "error":
        return THEME.error;
      default:
        return THEME.accent;
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "checkmark-sharp";
      case "error":
        return "alert-circle-outline";
      default:
        return "information-outline";
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <MotiView
          from={{ opacity: 0, translateY: -20, scale: 0.95 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          exit={{ opacity: 0, translateY: -20, scale: 0.95 }}
          transition={{ type: "timing", duration: 400 }}
          style={[styles.container, { top: insets.top + 10 }]}
        >
          {/* Ligne d'accentuation supérieure (Style Sceau) */}
          <View
            style={[styles.topBar, { backgroundColor: getAccentColor() }]}
          />

          <View style={styles.content}>
            <View style={styles.iconWrapper}>
              <Ionicons name={getIcon()} size={18} color={getAccentColor()} />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.label}>
                {type === "error" ? "NOTIFICATION D'ERREUR" : "CONFIRMATION"}
              </Text>
              <Text style={styles.text}>{message}</Text>
            </View>
          </View>
        </MotiView>
      )}
    </AnimatePresence>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 20,
    right: 20,
    backgroundColor: THEME.background,
    borderRadius: 0, // Rectangulaire luxe
    borderWidth: 1,
    borderColor: THEME.border,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 9999,
  },
  topBar: {
    height: 3,
    width: "100%",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.1)",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  label: {
    fontSize: 8,
    fontWeight: "800",
    color: THEME.accent,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  text: {
    color: THEME.textMain,
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontStyle: "italic",
    lineHeight: 18,
  },
});
