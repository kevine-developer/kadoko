import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// --- THEME LUXE ---
const THEME = {
  surface: "#FFFFFF", // Blanc pur
  primary: "#111827", // Noir profond
  textSecondary: "#6B7280", // Gris moyen
  border: "rgba(0,0,0,0.06)", // Bordure très subtile
};

interface FloatingDockProps {
  handleAdd: () => void;
  handleEdit: () => void;
  handleDelete: () => void;
}



const FloatingDockActions = ({ handleAdd, handleEdit, handleDelete }: FloatingDockProps) => {
  const insets = useSafeAreaInsets();

  const bottomOffset = insets.bottom > 0 ? insets.bottom : 24;

  return (
    <View style={[styles.container, { bottom: bottomOffset }]}>
      <View style={styles.dockSurface}>
        {/* GROUPE GAUCHE */}
        <TouchableOpacity
          style={styles.dockItem}
          activeOpacity={0.7}
          onPress={() => {}}
        >
          <Ionicons
            name="share-outline"
            size={22}
            color={THEME.textSecondary}
          />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.dockItem}
          activeOpacity={0.7}
          onPress={() => {handleEdit()}}
        >
          <Ionicons
            name="pencil-outline"
            size={22}
            color={THEME.textSecondary}
          />
        </TouchableOpacity>

        {/* BOUTON PRINCIPAL (Flottant) */}
        <TouchableOpacity
          style={styles.mainButton}
          activeOpacity={0.9}
          onPress={() => {handleAdd()}}
        >
          <Ionicons name="add" size={30} color="#FFFFFF" />
        </TouchableOpacity>

        {/* GROUPE DROITE */}
        <TouchableOpacity
          style={styles.dockItem}
          activeOpacity={0.7}
          onPress={() => {handleDelete()}}
        >
          <Ionicons
            name="trash-outline"
            size={22}
            color={THEME.textSecondary}
          />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.dockItem}
          activeOpacity={0.7}
          onPress={() => {}}
        >
          <Ionicons
            name="settings-outline"
            size={22}
            color={THEME.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FloatingDockActions;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 100,
  },
  dockSurface: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)", // Légère transparence
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 36, // Forme Pill parfaite
    gap: 12,

    // Bordure fine
    borderWidth: 1,
    borderColor: THEME.border,

    // Ombre diffuse "Premium"
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  /* ITEMS */
  dockItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },

  /* SEPARATEUR */
  divider: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginHorizontal: 4,
  },

  /* BOUTON CENTRAL */
  mainButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.primary, // Noir
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
    // Effet "Pop out" vers le haut
    transform: [{ translateY: -12 }],
    // Ombre spécifique au bouton
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    // Bordure blanche pour séparer du dock si superposition
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
});
