import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Platform,
  TextInputProps,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";

interface EditorialInputProps extends TextInputProps {
  label: string;
}

export const EditorialInput = ({
  label,
  value,
  onChangeText,
  ...props
}: EditorialInputProps) => {
  const theme = useAppTheme();

  return (
    <View style={styles.inputGroup}>
      <ThemedText
        type="label"
        colorName="textSecondary"
        style={styles.miniLabel}
      >
        {label}
      </ThemedText>
      <TextInput
        style={[
          styles.editorialInput,
          {
            color: theme.textMain,
            borderBottomColor: theme.border,
            fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
          },
          props.multiline && { minHeight: 40, paddingTop: 8 },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#BCBCBC"
        selectionColor={theme.accent}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 15,
  },
  miniLabel: {
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  editorialInput: {
    fontSize: 16,
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
});
