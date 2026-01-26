import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";

// --- THEME ÉDITORIAL COHÉRENT ---
const THEME = {
  overlay: "rgba(26, 26, 26, 0.7)", // Fond sombre soyeux
  background: "#FDFBF7", // Bone Silk
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062", // Or brossé
  danger: "#C34A4A", // Rouge brique luxe
  border: "rgba(0,0,0,0.08)",
};

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function ConfirmationModal({
  visible,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "CONFIRMER",
  cancelText = "ANNULER",
  isDestructive = false,
}: ConfirmationModalProps) {
  const handleConfirm = () => {
    Haptics.notificationAsync(
      isDestructive
        ? Haptics.NotificationFeedbackType.Warning
        : Haptics.NotificationFeedbackType.Success,
    );
    onConfirm();
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* PETIT DIVISEUR DÉCORATIF OR */}
          <View style={styles.topAccent} />

          <View style={styles.content}>
            {/* TITRE ÉDITORIAL */}
            <Text style={styles.title}>{title}</Text>

            {/* DESCRIPTION MANUSCRITE */}
            <Text style={styles.description}>{description}</Text>
          </View>

          {/* ACTIONS AUTHORITY (STYLE RECTANGULAIRE) */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmBtn,
                isDestructive ? styles.destructiveBtn : styles.primaryBtn,
              ]}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: THEME.overlay,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  container: {
    width: "100%",
    backgroundColor: THEME.background,
    borderRadius: 0, // Rectangulaire luxe
    borderWidth: 1,
    borderColor: THEME.border,
    paddingTop: 2, // Pour laisser voir l'accent top
    // Ombre très diffuse
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
  },
  topAccent: {
    height: 3,
    backgroundColor: THEME.accent,
    width: "100%",
  },
  content: {
    padding: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    textAlign: "center",
    marginBottom: 15,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    color: THEME.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    fontStyle: "italic",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  actionRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  cancelBtn: {
    flex: 1,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: THEME.border,
  },
  confirmBtn: {
    flex: 1,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1.5,
  },
  confirmText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 1.5,
  },
  primaryBtn: {
    backgroundColor: THEME.textMain,
  },
  destructiveBtn: {
    backgroundColor: THEME.danger,
  },
});
