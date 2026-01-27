import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";

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
  const theme = useAppTheme();

  const onPress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleSocialLogin();
  };

  return (
    <TouchableOpacity
      style={[
        styles.socialBtn,
        { backgroundColor: theme.surface, borderColor: theme.border },
        disabled && {
          backgroundColor: "rgba(0,0,0,0.01)",
          borderColor: "rgba(0,0,0,0.04)",
        },
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.6}
    >
      <View style={styles.content}>
        <ThemedIcon
          name={icon}
          size={18}
          colorName={disabled ? "textSecondary" : "textMain"}
        />
        <ThemedText
          type="label"
          colorName={disabled ? "textSecondary" : "textMain"}
          style={[styles.socialText, disabled && { opacity: 0.5 }]}
        >
          {label.toUpperCase()}
        </ThemedText>
      </View>

      {disabled && (
        <View style={styles.comingSoonWrapper}>
          <ThemedText
            type="label"
            colorName="accent"
            style={styles.comingSoonText}
          >
            BIENTÔT
          </ThemedText>
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
    borderRadius: 0,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  socialText: {
    fontSize: 11,
    letterSpacing: 1.2,
  },
  comingSoonWrapper: {
    position: "absolute",
    bottom: -18,
    width: "100%",
    alignItems: "center",
  },
  comingSoonText: {
    fontSize: 8,
    letterSpacing: 1,
  },
});
