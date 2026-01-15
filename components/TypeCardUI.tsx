import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface TypeCardUIProps {
  label: string;
  emoji?: string;
  onPress: () => void;
  isSelected?: boolean;
  variant?: "default" | "add" | "all";
  customIcon?: React.ReactNode; // Pour passer un bouton "+" ou une icône spécifique
}

const TypeCardUI = ({
  label,
  emoji,
  onPress,
  isSelected = false,
  variant = "default",
  customIcon,
}: TypeCardUIProps) => {
  // Déterminer les styles selon la variante et l'état
  const getContainerStyle = () => {
    let baseStyle: ViewStyle[] = [styles.typeCard];

    if (variant === "add") baseStyle.push(styles.actionCardAdd);
    if (variant === "all") baseStyle.push(styles.actionCardAll);
    if (isSelected) baseStyle.push(styles.typeCardSelected);

    return baseStyle;
  };

  const getTextStyle = (): TextStyle[] => {
    return [styles.typeLabel, isSelected ? styles.typeLabelSelected : {}];
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={getContainerStyle()}
    >
      {/* Affichage de l'icône (Emoji, Cercle d'action ou Custom) */}
      <View style={styles.iconContainer}>
        {variant === "add" && (
          <View style={styles.actionCircleAdd}>
            <Text style={styles.actionIconText}>+</Text>
          </View>
        )}
        {variant === "all" && (
          <View style={styles.actionCircleAll}>
            <Text style={styles.actionIconText}>📂</Text>
          </View>
        )}
        {emoji && <Text style={styles.typeEmoji}>{emoji}</Text>}
        {customIcon && customIcon}
      </View>

      <Text style={getTextStyle()}>{label}</Text>
    </TouchableOpacity>
  );
};

export default TypeCardUI;

const styles = StyleSheet.create({
  typeCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 95,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    // Ombre 3D style jeu
    shadowColor: "#E2E8F0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  typeCardSelected: {
    borderColor: "#7C3AED",
    backgroundColor: "#F5F3FF",
    shadowOffset: { width: 0, height: 2 },
  },
  iconContainer: {
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  typeEmoji: {
    fontSize: 28,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  typeLabelSelected: {
    color: "#7C3AED",
  },
  // Variantes spécifiques
  actionCardAdd: { backgroundColor: "#F0FDF4", borderColor: "#22C55E" },
  actionCardAll: { backgroundColor: "#EFF6FF", borderColor: "#3B82F6" },
  actionCircleAdd: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
  },
  actionCircleAll: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  actionIconText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
});
