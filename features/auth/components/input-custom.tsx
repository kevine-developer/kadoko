import {
  StyleSheet,
  TextInput,
  View,
  TextInputProps,
  TouchableOpacity,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";
import { ThemedText } from "@/components/themed-text";

interface InputCustomProps extends TextInputProps {
  label?: string;
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
  const theme = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const togglePassword = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.container}>
      {label && (
        <ThemedText
          type="label"
          colorName="textSecondary"
          style={styles.miniLabel}
        >
          {label.toUpperCase()}
        </ThemedText>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            borderBottomColor: theme.border,
          },
          isFocused && {
            borderBottomColor: theme.accent,
            borderBottomWidth: 1.5,
          },
          error ? { borderBottomColor: theme.danger } : null,
        ]}
      >
        {icon && (
          <ThemedIcon
            name={icon}
            size={18}
            color={isFocused ? theme.accent : "#BCBCBC"}
          />
        )}
        {icon && <View style={{ width: 12 }} />}
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#BCBCBC"
          style={[
            styles.input,
            {
              color: theme.textMain,
              fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          selectionColor={theme.accent}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={togglePassword} style={styles.eyeBtn}>
            <ThemedText type="label" style={{ color: theme.textMain }}>
              {isPasswordVisible ? "MASQUER" : "VOIR"}
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <ThemedText
          type="caption"
          style={{
            color: theme.danger,
            marginTop: 6,
            fontStyle: "italic",
            fontWeight: "600",
          }}
        >
          {error}
        </ThemedText>
      )}
    </View>
  );
};

export default InputCustom;

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    width: "100%",
  },
  miniLabel: {
    letterSpacing: 1.5,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 54,
    borderRadius: 0,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
  },
  eyeBtn: {
    paddingHorizontal: 8,
    height: "100%",
    justifyContent: "center",
  },
});
