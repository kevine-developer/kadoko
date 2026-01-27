import React, { useEffect } from "react";
import { StyleSheet, View, Platform } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
}

export const Toast = ({ visible, message, type = "info" }: ToastProps) => {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

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
        return theme.accent;
      case "error":
        return theme.danger;
      default:
        return theme.accent;
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
          style={[
            styles.container,
            {
              top: insets.top + 10,
              backgroundColor:
                theme.background === "#FFFFFF" ? "#1A1A1A" : theme.surface, // Garde un contraste fort en mode clair
              borderColor: theme.border,
            },
          ]}
        >
          <View
            style={[styles.topBar, { backgroundColor: getAccentColor() }]}
          />

          <View style={styles.content}>
            <View
              style={[styles.iconWrapper, { borderRightColor: theme.border }]}
            >
              <ThemedIcon
                name={getIcon() as any}
                size={18}
                colorName={type === "error" ? "danger" : "accent"}
              />
            </View>

            <View style={styles.textContainer}>
              <ThemedText type="label" colorName="accent" style={styles.label}>
                {type === "error" ? "NOTIFICATION D'ERREUR" : "CONFIRMATION"}
              </ThemedText>
              <ThemedText
                type="subtitle"
                style={[
                  styles.text,
                  {
                    color:
                      theme.background === "#FFFFFF"
                        ? "#FDFBF7"
                        : theme.textMain,
                    fontStyle: "italic",
                  },
                ]}
              >
                {message}
              </ThemedText>
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
    borderRadius: 0,
    borderWidth: 1,
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
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  label: {
    fontSize: 8,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  text: {
    fontSize: 14,
    lineHeight: 18,
  },
});
