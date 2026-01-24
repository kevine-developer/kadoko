import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

// --- THEME ÉDITORIAL COHÉRENT ---
const THEME = {
  background: "#FDFBF7", // Bone Silk
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.08)",
};

interface BtnSocialProps {
  handleSocialLogin: () => void;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  disabled?: boolean;
}

const BtnSocial = ({
  handleSocialLogin,
  icon,
  label,
  disabled,
}: BtnSocialProps) => {
  const onPress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleSocialLogin();
  };

  return (
    <TouchableOpacity
      style={[styles.socialBtn, disabled && styles.disabledBtn]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.6}
    >
      <View style={styles.content}>
        <Ionicons
          name={icon}
          size={18}
          color={disabled ? THEME.textSecondary : THEME.textMain}
        />
        <Text style={[styles.socialText, disabled && styles.disabledText]}>
          {label.toUpperCase()}
        </Text>
      </View>

      {disabled && (
        <View style={styles.comingSoonWrapper}>
          <Text style={styles.comingSoonText}>BIENTÔT</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default BtnSocial;

const styles = StyleSheet.create({
  socialBtn: {
    flex: 1,
    height: 54,
    borderRadius: 0, // Carré luxe pour un aspect architectural
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    // Pas d'ombres lourdes, on privilégie la pureté de la ligne
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  socialText: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.textMain,
    letterSpacing: 1.2, // Espacement luxueux
  },
  disabledBtn: {
    backgroundColor: "rgba(0,0,0,0.01)",
    borderColor: "rgba(0,0,0,0.04)",
  },
  disabledText: {
    color: THEME.textSecondary,
    opacity: 0.5,
  },
  comingSoonWrapper: {
    position: "absolute",
    bottom: -18, // Placé sous le bouton comme une légende
    width: "100%",
    alignItems: "center",
  },
  comingSoonText: {
    fontSize: 8,
    fontWeight: "800",
    color: THEME.accent, // Touche dorée discrète
    letterSpacing: 1,
  },
});
