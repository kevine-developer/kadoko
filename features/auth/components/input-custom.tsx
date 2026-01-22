import {
  StyleSheet,
  TextInput,
  View,
  TextInputProps,
  TouchableOpacity,
  Text,
} from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

// --- THEME LUXE ---
const THEME = {
  background: "#FDFBF7", // Blanc cassé "Bone"
  surface: "#FFFFFF",
  textMain: "#111827", // Noir profond
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  primary: "#111827",
  inputBg: "#FFFFFF",
};

interface InputCustomProps {
  icon?: keyof typeof Ionicons.glyphMap;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  keyboardType?: TextInputProps["keyboardType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  secureTextEntry?: boolean;
  showPassword?: () => void;
  error?: string;
}
const InputCustom = ({
  icon,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  autoCapitalize,
  secureTextEntry,
  showPassword,
  error,
}: InputCustomProps) => {
  return (
    <View style={styles.container}>
      <View
        style={[styles.inputWrapper, error ? styles.inputWrapperError : null]}
      >
        <Ionicons
          name={icon}
          size={20}
          color="#9CA3AF"
          style={styles.inputIcon}
        />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          value={value}
          onChangeText={(text) => {
            onChangeText && onChangeText(text);
          }}
        />
        {showPassword && (
          <TouchableOpacity onPress={showPassword} style={styles.eyeBtn}>
            <Ionicons
              name={secureTextEntry ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default InputCustom;

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.surface,
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    // Légère ombre interne simulée par border
  },
  inputWrapperError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  container: {
    marginBottom: 0,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: THEME.textMain,
  },
  eyeBtn: {
    padding: 8,
  },
  forgotBtn: {
    alignSelf: "flex-end",
  },
  forgotText: {
    fontSize: 13,
    color: THEME.textSecondary,
    fontWeight: "600",
  },
});
