import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const THEME = {
  textMain: "#1A1A1A",
  primary: "#1A1A1A",
  border: "rgba(0,0,0,0.08)",
};

interface PreferenceChipProps {
  label: string;
  icon?:any;
  active?: boolean;
  onPress: () => void;
}

export const PreferenceChip = ({
  label,
  icon,
  active,
  onPress,
}: PreferenceChipProps) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.prefChip, active && styles.prefChipActive]}
      onPress={handlePress}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={14}
          color={active ? "#FFF" : THEME.textMain}
          style={{ marginRight: 8 }}
        />
      )}
      <Text style={[styles.prefChipText, active && styles.prefChipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  prefChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: "#FFF",
    marginBottom: 8,
  },
  prefChipActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  prefChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.textMain,
  },
  prefChipTextActive: {
    color: "#FFF",
  },
});