import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from "react-native";

type Variant = "primary" | "secondary" | "danger" | "success";

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: Variant;
  styleContainer?: ViewStyle;
}

const ButtonUI = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
  styleContainer,
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <View style={[styles.container, styleContainer]}>
      {/* L'ombre/épaisseur du bouton (ne bouge pas) */}
      <View style={[styles.shadow, variantStyles[variant].shadow]} />
      
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.buttonFace,
          variantStyles[variant].face,
          pressed && !isDisabled && styles.pressed, // Translation vers le bas
          isDisabled && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={[styles.text, variantStyles[variant].text]}>
            {title.toUpperCase()}
          </Text>
        )}
      </Pressable>
    </View>
  );
};

export default ButtonUI;

const colors = {
  primary: { face: "#3B82F6", shadow: "#1D4ED8" },   // Bleu
  secondary: { face: "#A855F7", shadow: "#7E22CE" }, // Violet
  danger: { face: "#EF4444", shadow: "#B91C1C" },    // Rouge
  success: { face: "#22C55E", shadow: "#15803D" },   // Vert
  disabled: "#6B7280",
  disabledShadow: "#374151",
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    marginBottom: 6, // Espace pour l'ombre
  },
  buttonFace: {
    minHeight: 54,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)", // Petit reflet sur le dessus
  },
  shadow: {
    position: "absolute",
    top: 6, // Décale l'ombre vers le bas
    left: 0,
    right: 0,
    bottom: -6,
    borderRadius: 12,
  },
  pressed: {
    transform: [{ translateY: 6 }], // Le bouton descend sur l'ombre
  },
  disabled: {
    backgroundColor: colors.disabled,
    opacity: 0.8,
  },
  text: {
    fontSize: 18,
    fontWeight: "900", // Très gras pour le style jeu
    letterSpacing: 1.5,
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});

const variantStyles: Record<
  Variant,
  { face: ViewStyle; shadow: ViewStyle; text: TextStyle }
> = {
  primary: {
    face: { backgroundColor: colors.primary.face },
    shadow: { backgroundColor: colors.primary.shadow },
    text: { color: "#fff" },
  },
  secondary: {
    face: { backgroundColor: colors.secondary.face },
    shadow: { backgroundColor: colors.secondary.shadow },
    text: { color: "#fff" },
  },
  danger: {
    face: { backgroundColor: colors.danger.face },
    shadow: { backgroundColor: colors.danger.shadow },
    text: { color: "#fff" },
  },
  success: {
    face: { backgroundColor: colors.success.face },
    shadow: { backgroundColor: colors.success.shadow },
    text: { color: "#fff" },
  },
};