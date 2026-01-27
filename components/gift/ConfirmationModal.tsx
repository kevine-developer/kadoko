import React from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";

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
  const theme = useAppTheme();

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
      <View
        style={[
          styles.overlay,
          {
            backgroundColor:
              theme.background === "#FFFFFF"
                ? "rgba(0,0,0,0.4)"
                : "rgba(26, 26, 26, 0.7)",
          },
        ]}
      >
        <View
          style={[
            styles.container,
            { backgroundColor: theme.background, borderColor: theme.border },
          ]}
        >
          {/* PETIT DIVISEUR DÉCORATIF OR */}
          <View style={[styles.topAccent, { backgroundColor: theme.accent }]} />

          <View style={styles.content}>
            {/* TITRE ÉDITORIAL */}
            <ThemedText type="hero" style={styles.title}>
              {title}
            </ThemedText>

            {/* DESCRIPTION MANUSCRITE */}
            <ThemedText
              type="subtitle"
              colorName="textSecondary"
              style={styles.description}
            >
              {description}
            </ThemedText>
          </View>

          {/* ACTIONS AUTHORITY (STYLE RECTANGULAIRE) */}
          <View style={[styles.actionRow, { borderTopColor: theme.border }]}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderRightColor: theme.border }]}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <ThemedText
                type="label"
                colorName="textSecondary"
                style={styles.cancelText}
              >
                {cancelText}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmBtn,
                isDestructive
                  ? { backgroundColor: theme.danger }
                  : { backgroundColor: theme.textMain },
              ]}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <ThemedText
                type="label"
                style={[styles.confirmText, { color: theme.background }]}
              >
                {confirmText}
              </ThemedText>
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  container: {
    width: "100%",
    borderRadius: 0,
    borderWidth: 1,
    paddingTop: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
  },
  topAccent: {
    height: 3,
    width: "100%",
  },
  content: {
    padding: 32,
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 15,
  },
  description: {
    textAlign: "center",
  },
  actionRow: {
    flexDirection: "row",
    borderTopWidth: 1,
  },
  cancelBtn: {
    flex: 1,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
  },
  confirmBtn: {
    flex: 1,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    letterSpacing: 1.5,
  },
  confirmText: {
    letterSpacing: 1.5,
  },
});
