import { StyleSheet, View } from "react-native";
import React from "react";
import ThemedIcon from "@/components/themed-icon";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";

interface EmptyListTabProps {
  title: string;
  icon: any;
}

const EmptyListTab = ({ title, icon }: EmptyListTabProps) => {

  const theme = useAppTheme();

  return (
    <View style={styles.emptyState}>
      <View style={[styles.iconCircle, { borderColor: `${theme.accent}33` }]}>
        <ThemedIcon name={icon} size={28} color={theme.accent} />
      </View>
      <ThemedText
        type="subtitle"
        style={[{ color: theme.textSecondary }]}
      >
        {title}
      </ThemedText>

      <View style={[styles.decorativeLine, { backgroundColor: theme.accent }]} />
    </View>
  );
};

export default EmptyListTab;

const styles = StyleSheet.create({
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  decorativeLine: {
    width: 30,
    height: 1,
    marginTop: 24,
    opacity: 0.4,
  },
});
