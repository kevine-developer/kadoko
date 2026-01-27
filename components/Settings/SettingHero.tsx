import { StyleSheet, View } from "react-native";
import React from "react";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import { MotiView } from "moti";

interface SettingHeroProps {
  title: string;
  subtitle?: string;
}

const SettingHero = ({ title, subtitle }: SettingHeroProps) => {
  const theme = useAppTheme();
  return (
    <MotiView
      from={{ opacity: 0, translateY: 15 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 800 }}
      style={styles.heroSection}
    >
      <ThemedText type="hero">{title}</ThemedText>
      <View style={[styles.titleDivider, { backgroundColor: theme.accent }]} />
      <ThemedText type="default" colorName="textSecondary">
        {subtitle}
      </ThemedText>
    </MotiView>
  );
};

export default SettingHero;

const styles = StyleSheet.create({
  heroSection: { marginBottom: 10 },
  titleDivider: { width: 35, height: 2, marginVertical: 25 },
});
