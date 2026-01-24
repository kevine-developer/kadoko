import React from "react";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
  Text,
} from "react-native";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
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

export interface AlertAction {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
}

interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  actions: AlertAction[];
  onClose: () => void;
}

export const AlertModal = ({
  visible,
  title,
  message,
  actions,
  onClose,
}: AlertModalProps) => {
  const handlePress = (action: AlertAction) => {
    if (action.style === "destructive") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    action.onPress?.();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <MotiView
          from={{ opacity: 0, scale: 0.98, translateY: 10 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400 }}
          style={styles.container}
        >
          {/* LIGNE D'ACCENTUATION OR DISSIMULÉE */}
          <View style={styles.topAccent} />

          <View style={styles.content}>
            {/* ICONE BIJOU */}
            <View style={styles.iconWrapper}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color={THEME.accent}
              />
            </View>

            {/* TITRE ÉDITORIAL */}
            <Text style={styles.title}>{title}</Text>

            {/* MESSAGE MANUSCRIT */}
            <Text style={styles.message}>{message}</Text>
          </View>

          {/* ACTIONS STYLE "REGISTRE" */}
          <View
            style={[
              styles.actionsContainer,
              actions.length > 2 && { flexDirection: "column" },
            ]}
          >
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                style={[
                  styles.button,
                  index > 0 && actions.length <= 2 && styles.borderLeft,
                  index > 0 && actions.length > 2 && styles.borderTop,
                  action.style === "destructive" && styles.buttonDestructive,
                ]}
                onPress={() => handlePress(action)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    action.style === "destructive" && styles.textDestructive,
                    action.style === "cancel" && styles.textCancel,
                  ]}
                >
                  {action.text.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </MotiView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: THEME.overlay,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  container: {
    backgroundColor: THEME.background,
    width: "100%",
    maxWidth: 340,
    borderRadius: 0, // Rectangulaire luxe
    borderWidth: 1,
    borderColor: THEME.border,
    overflow: "hidden",
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
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(175, 144, 98, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  message: {
    fontSize: 14,
    color: THEME.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    fontStyle: "italic",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  actionsContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  button: {
    flex: 1,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  buttonDestructive: {
    backgroundColor: "rgba(195, 74, 74, 0.03)",
  },
  borderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: THEME.border,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  buttonText: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.textMain,
    letterSpacing: 1.5,
  },
  textCancel: {
    color: THEME.textSecondary,
    fontWeight: "600",
  },
  textDestructive: {
    color: THEME.danger,
  },
});
