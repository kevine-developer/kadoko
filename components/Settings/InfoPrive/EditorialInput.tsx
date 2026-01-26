import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  TextInputProps,
} from "react-native";

const THEME = {
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062",
  border: "rgba(0,0,0,0.08)",
};

interface EditorialInputProps extends TextInputProps {
  label: string;
}

export const EditorialInput = ({
  label,
  value,
  onChangeText,
  ...props
}: EditorialInputProps) => {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.miniLabel}>{label}</Text>
      <TextInput
        style={[
          styles.editorialInput,
          props.multiline && { minHeight: 40, paddingTop: 8 }
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#BCBCBC"
        selectionColor={THEME.accent}
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
    fontSize: 9,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  editorialInput: {
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    paddingVertical: 10,
  },
});