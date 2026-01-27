import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "../../themed-icon";

interface PreferenceChipProps {
  label: string;
  icon?: any;
  active?: boolean;
  onPress: () => void;
}

export const PreferenceChip = ({
  label,
  icon,
  active,
  onPress,
}: PreferenceChipProps) => {
  const theme = useAppTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        styles.prefChip,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
        active && {
          backgroundColor: theme.textMain,
          borderColor: theme.textMain,
        },
      ]}
      onPress={handlePress}
    >
      {icon && (
        <ThemedIcon
          name={icon}
          size={14}
          color={active ? theme.background : theme.textMain}
        />
      )}
      <ThemedText
        type="defaultBold"
        style={[
          styles.prefChipText,
          { color: theme.textMain },
          active && { color: theme.background },
        ]}
      >
        {label}
      </ThemedText>
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
    marginBottom: 8,
  },
  prefChipText: {
    fontSize: 12,
  },
});
