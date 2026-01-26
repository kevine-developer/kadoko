import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import * as Haptics from "expo-haptics";

// On garde la cohérence visuelle
const THEME = {
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  primary: "#1A1A1A",
  border: "rgba(0,0,0,0.08)",
};

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
  return (
    <View style={styles.container}>
      <Text style={styles.miniLabel}>{label}</Text>
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
              selected === opt && styles.sizeItemActive,
            ]}
            onPress={() => {
              Haptics.selectionAsync(); // Petit clic discret lors de la sélection
              onSelect(opt);
            }}
          >
            <Text
              style={[
                styles.sizeItemText,
                selected === opt && styles.sizeItemTextActive,
              ]}
            >
              {opt}
            </Text>
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
    fontSize: 9,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  scrollArea: {
    marginTop: 10,
    marginHorizontal: -30, // Pour que le défilement aille jusqu'au bord de l'écran
  },
  scrollContent: {
    paddingHorizontal: 30, // On remet le padding interne pour aligner le premier item
  },
  sizeItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: "#FFF",
    minWidth: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  sizeItemActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  sizeItemText: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.textMain,
  },
  sizeItemTextActive: {
    color: "#FFF",
  },
});