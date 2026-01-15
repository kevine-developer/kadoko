import { useThemeColor } from "@/hooks/use-theme-color";
import React, { useState } from "react";
import { StyleSheet, TextInput, TextInputProps, ViewStyle } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
interface InputUIProps extends TextInputProps {
  label: string;
  icon?: string;
  containerStyle?: ViewStyle;
}

const InputUI = ({ label, icon, containerStyle, ...props }: InputUIProps) => {
  const backgroundColor = useThemeColor({}, "backgroundPrimary");
  const color = useThemeColor({}, "textPrimary");
  const [isFocused, setIsFocused] = useState(false);

  return (
    <ThemedView>
      {/* Label avec style "Game" (Majuscules, gras, espacé) */}
      <ThemedText style={styles.label}>
        {icon ? `${icon} ` : ""}
        {label.toUpperCase()}
      </ThemedText>

      {/* Wrapper pour gérer la bordure et le focus */}
      <ThemedView
        style={[
          styles.inputWrapper,
          { backgroundColor },
          isFocused && styles.inputWrapperFocused,
          props.multiline && styles.textareaWrapper,
        ]}
      >
        <TextInput
          style={[styles.input, { color }, props.multiline && styles.textarea]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="#94A3B8"
          {...props} // On passe toutes les props natives (value, onChangeText, etc.)
        />
      </ThemedView>
    </ThemedView>
  );
};

export default InputUI;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputWrapper: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    // Simulation de profondeur interne
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputWrapperFocused: {
    borderColor: "#7C3AED",
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: "700",
  },
  textareaWrapper: {
    minHeight: 100,
  },
  textarea: {
    textAlignVertical: "top", // Important pour Android
    minHeight: 100,
    paddingTop: 14,
  },
});
