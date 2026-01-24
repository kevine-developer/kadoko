import {
  StyleSheet,
  TextInput,
  View,
  TextInputProps,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";
import React, { useState } from "react";
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
  error: "#C34A4A",
};

interface InputCustomProps extends TextInputProps {
  label?: string; // Ajout d'un label pour le style catalogue
  icon?: keyof typeof Ionicons.glyphMap;
  showPasswordToggle?: boolean;
  error?: string;
}

const InputCustom = ({
  label,
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  error,
  ...props
}: InputCustomProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const togglePassword = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.container}>
      {/* Label style "Étiquette de luxe" */}
      {label && <Text style={styles.miniLabel}>{label.toUpperCase()}</Text>}

      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          error ? styles.inputWrapperError : null,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={isFocused ? THEME.accent : "#BCBCBC"}
            style={styles.inputIcon}
          />
        )}

        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#BCBCBC"
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          selectionColor={THEME.accent}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity onPress={togglePassword} style={styles.eyeBtn}>
            <Text style={styles.eyeText}>
              {isPasswordVisible ? "MASQUER" : "VOIR"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default InputCustom;

const styles = StyleSheet.create({
  container: {
    marginBottom: 25,
    width: "100%",
  },
  miniLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 10,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.surface,
    height: 54,
    borderRadius: 0, // Carré luxe
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    // Pas d'ombres massives, juste une structure nette
  },
  inputWrapperFocused: {
    borderBottomColor: THEME.accent,
    borderBottomWidth: 1.5,
  },
  inputWrapperError: {
    borderBottomColor: THEME.error,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: THEME.textMain,
    // Utilisation du Serif pour le contenu saisi (plus élégant)
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  eyeBtn: {
    paddingHorizontal: 8,
    height: "100%",
    justifyContent: "center",
  },
  eyeText: {
    fontSize: 9,
    fontWeight: "800",
    color: THEME.textMain,
    letterSpacing: 1,
  },
  errorText: {
    color: THEME.error,
    fontSize: 11,
    marginTop: 6,
    fontWeight: "600",
    fontStyle: "italic",
  },
});
