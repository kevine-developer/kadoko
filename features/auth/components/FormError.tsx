import React from "react";
import { StyleSheet, View, Platform } from "react-native";
import { MotiView } from "moti";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";

interface FormErrorProps {
  message?: string | null;
}

export const FormError = ({ message }: FormErrorProps) => {
  const theme = useAppTheme();

  if (!message) return null;

  return (
    <MotiView
      from={{ opacity: 0, translateY: -10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 400 }}
      style={[
        styles.container,
        {
          backgroundColor:
            theme.background === "#FFFFFF"
              ? "#FFF9F9"
              : "rgba(195, 74, 74, 0.1)",
          borderColor: theme.danger,
        },
      ]}
    >
      <View
        style={[styles.errorIndicator, { backgroundColor: theme.danger }]}
      />

      <View style={styles.content}>
        <ThemedIcon
          name="information-circle-outline"
          size={16}
          colorName="danger"
        />
        <ThemedText type="caption" colorName="danger" style={styles.text}>
          {message}
        </ThemedText>
      </View>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: 25,
    borderRadius: 0,
    borderWidth: 1,
    overflow: "hidden",
  },
  errorIndicator: {
    width: 3,
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
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontStyle: "italic",
    lineHeight: 18,
  },
});
