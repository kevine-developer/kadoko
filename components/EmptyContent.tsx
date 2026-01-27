import { StyleSheet, View } from "react-native";
import React from "react";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";
import { ThemedText } from "./themed-text";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
interface EmptyContentProps {
  title?: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

const EmptyContent = ({ title, subtitle, icon }: EmptyContentProps) => {
  const theme = useAppTheme();
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "timing", duration: 800 }}
      style={styles.emptyContent}
    >
      <View style={[styles.iconCircle, { borderColor: `${theme.accent}33` }]}>
        <ThemedIcon
          name={icon || "gift-outline"}
          size={28}
          color={theme.accent}
        />
      </View>
      <ThemedText
        type="title"
        colorName="textMain"
        style={styles.emptyContentTitle}
      >
        {title || "Aucun résultat"}
      </ThemedText>
      <ThemedText
        type="subtitle"
        colorName="textSecondary"
        style={styles.emptyContentText}
      >
        {subtitle || "Aucun résultat"}
      </ThemedText>
      <View
        style={[styles.decorativeLine, { backgroundColor: theme.accent }]}
      />
    </MotiView>
  );
};

export default EmptyContent;

const styles = StyleSheet.create({
  emptyContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingVertical: 100,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyContentTitle: {
    fontSize: 20,
    marginBottom: 5,
  },
  emptyContentText: {
    textAlign: "center",
    fontSize: 14,
  },
  decorativeLine: {
    width: 30,
    height: 1,
    marginTop: 14,
    opacity: 0.4,
  },
});
