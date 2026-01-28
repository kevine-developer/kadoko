import { StyleSheet, View } from "react-native";
import React from "react";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";

interface StatEntryProps {
  value: number;
  label: string;
}

export const StatEntry = ({ value, label }: StatEntryProps) => {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <ThemedText type="default" bold style={styles.number}>
        {value || 0}
      </ThemedText>
      <ThemedText type="label" style={{ color: theme.textSecondary }}>
        {label}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
  },
  number: {
    marginBottom: 4,
  },
});
