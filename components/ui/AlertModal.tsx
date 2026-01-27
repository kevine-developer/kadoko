import React from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";

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
  const theme = useAppTheme();

  const handlePress = (action: AlertAction) => {
    if (action.style === "destructive") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    action.onPress?.();
  };

const dangerBackground = "rgba(255, 0, 0, 0.1)";

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
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
        <MotiView
          from={{ opacity: 0, scale: 0.98, translateY: 10 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400 }}
          style={[
            styles.container,
            { backgroundColor: theme.background, borderColor: theme.border },
          ]}
        >
          <View style={[styles.topAccent, { backgroundColor: theme.accent }]} />

          <View style={styles.content}>
            <View
              style={[
                styles.iconWrapper,
                {
                  borderColor: dangerBackground,
                },
              ]}
            >
              <ThemedIcon
                name="information-circle-outline"
                size={24}
                colorName="accent"
              />
            </View>

            <ThemedText type="hero" style={styles.title}>
              {title}
            </ThemedText>
            <ThemedText
              type="subtitle"
              colorName="textSecondary"
              style={styles.message}
            >
              {message}
            </ThemedText>
          </View>

          <View
            style={[
              styles.actionsContainer,
              { borderTopColor: theme.border },
              actions.length > 2 && { flexDirection: "column" },
            ]}
          >
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                style={[
                  styles.button,
                  index > 0 &&
                    actions.length <= 2 && {
                      borderLeftWidth: 1,
                      borderLeftColor: theme.border,
                    },
                  index > 0 &&
                    actions.length > 2 && {
                      borderTopWidth: 1,
                      borderTopColor: theme.border,
                    },
                  action.style === "destructive" && {
                    backgroundColor: dangerBackground,
                  },
                ]}
                onPress={() => handlePress(action)}
              >
                <ThemedText
                  type="label"
                  bold
                  style={[
                    styles.buttonText,
                    { color: theme.textMain },
                    action.style === "destructive" && { color: theme.danger },
                    action.style === "cancel" && { color: theme.textSecondary },
                  ]}
                >
                  {action.text.toUpperCase()}
                </ThemedText>
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  container: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 0,
    borderWidth: 1,
    overflow: "hidden",
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
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    textAlign: "center",
  },
  actionsContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    letterSpacing: 1.5,
  },
});
