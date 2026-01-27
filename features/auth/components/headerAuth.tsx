import { Platform, StyleSheet, View } from "react-native";
import React from "react";
import { MotiView } from "moti";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";

interface HeaderAuthProps {
  title: string;
  subtitle: string;
}

const HeaderAuth = ({ title, subtitle }: HeaderAuthProps) => {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <MotiView
        from={{ width: 0, opacity: 0 }}
        animate={{ width: 35, opacity: 1 }}
        transition={{ type: "timing", duration: 800, delay: 200 }}
        style={[styles.topDivider, { backgroundColor: theme.accent }]}
      />

      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 600 }}
      >
        <ThemedText type="label" colorName="textSecondary" style={styles.label}>
          {subtitle.toUpperCase()}
        </ThemedText>
      </MotiView>

      <MotiView
        from={{ opacity: 0, translateY: 15 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 700, delay: 100 }}
      >
        <ThemedText type="hero" style={styles.title}>
          {title}
        </ThemedText>
      </MotiView>
    </View>
  );
};

export default HeaderAuth;

const styles = StyleSheet.create({
  container: {
    marginBottom: 25,
    marginTop: 10,
  },
  topDivider: {
    height: 2,
    marginBottom: 20,
  },
  label: {
    letterSpacing: 2,
    marginBottom: 12,
  },
  title: {
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: -1,
  },
});
