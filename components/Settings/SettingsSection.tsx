import React from "react";
import { StyleSheet, View } from "react-native";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import { ThemedText } from "../themed-text";

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingsSection = ({ title, children }: SettingsSectionProps) => {
  const theme = useAppTheme();
  return (
    <View style={styles.sectionContainer}>
      <ThemedText
        type="label"
        colorName="textSecondary"
        style={styles.sectionTitle}
      >
        {title}
      </ThemedText>
      <View style={[styles.sectionContent, { borderTopColor: theme.border }]}>
        {children}
      </View>
    </View>
  );
};
export default SettingsSection;

const styles = StyleSheet.create({
  sectionContainer: { marginBottom: 35 },
  sectionTitle: { marginBottom: 10 },
  sectionContent: { borderTopWidth: 1 },
});
