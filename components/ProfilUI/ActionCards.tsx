import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  primary: "#24884aff",
  primaryLight: "#F5F3FF",
  textMain: "#111827",
  textMuted: "#9CA3AF",
  white: "#FFFFFF",
  gray: "#E5E7EB",
  grayDark: "#6B7280",
  danger: "#EF4444", // Couleur pour l'annulation
};

const shadow = (
  color: string,
  opacity: number,
  radius: number,
  elev: number
) => ({
  ...Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: { elevation: elev },
  }),
});

const ActionCardsButton = ({
  icon,
  text,
  onPress,
  variant,
  disabled,
  style,
}: any) => {
  const [buttonScale] = useState(new Animated.Value(1));

  const handleButtonPressIn = () => {
    if (!disabled) {
      Animated.spring(buttonScale, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleButtonPressOut = () => {
    if (!disabled) {
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <Animated.View
      style={[{ flex: 1 }, { transform: [{ scale: buttonScale }] }]}
    >
      <TouchableOpacity
        activeOpacity={disabled ? 1 : 0.9}
        onPress={disabled ? undefined : onPress}
        onPressIn={handleButtonPressIn}
        onPressOut={handleButtonPressOut}
        disabled={disabled}
      >
        <View
          style={[
            styles.btn,
            variant === "primary" && !disabled && styles.btnPrimary,
            variant === "secondary" && styles.btnSecondary,
            variant === "danger" && styles.btnDanger,
            variant === "onlyIcon" && styles.btnOnlyIcon,
            disabled && styles.btnDisabled,
            style,
          ]}
        >
          <Ionicons
            name={icon}
            size={14}
            color={disabled ? COLORS.grayDark : COLORS.white}
          />
          <Text style={[styles.btnText, disabled && styles.btnTextDisabled]}>
            {text}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default ActionCardsButton;

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    paddingHorizontal: 4,
    borderRadius: 12,
    gap: 6,
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
    ...shadow(COLORS.primary, 0.3, 8, 4),
  },
  btnSecondary: {
    backgroundColor: COLORS.textMain,
    ...shadow("#000", 0.2, 8, 4),
  },
  btnDanger: {
    backgroundColor: "#757575ff",
    ...shadow("#000", 0.2, 8, 4),
  },
  btnOnlyIcon: {
    paddingVertical: 11,
    paddingHorizontal: 4,
    borderRadius: 12,
    backgroundColor: "#454647ff",
  },
  btnDisabled: {
    backgroundColor: COLORS.gray,
  },
  btnText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.white,
  },
  btnTextDisabled: {
    color: COLORS.grayDark,
  },
});
