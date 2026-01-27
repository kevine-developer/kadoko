import React from "react";
import { View, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";

interface SizeSelectorProps {
  label: string;
  options: string[];
  selected?: string;
  onSelect: (value: string) => void;
}

export const SizeSelector = ({
  label,
  options,
  selected,
  onSelect,
}: SizeSelectorProps) => {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <ThemedText
        type="label"
        colorName="textSecondary"
        style={styles.miniLabel}
      >
        {label}
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
      >
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            activeOpacity={0.8}
            style={[
              styles.sizeItem,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
              selected === opt && {
                backgroundColor: theme.textMain,
                borderColor: theme.textMain,
              },
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              onSelect(opt);
            }}
          >
            <ThemedText
              type="defaultBold"
              style={[
                styles.sizeItemText,
                { color: theme.textMain },
                selected === opt && { color: theme.background },
              ]}
            >
              {opt}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 25,
  },
  miniLabel: {
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  scrollArea: {
    marginTop: 10,
    marginHorizontal: -30,
  },
  scrollContent: {
    paddingHorizontal: 30,
  },
  sizeItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    minWidth: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  sizeItemText: {
    fontSize: 13,
  },
});
