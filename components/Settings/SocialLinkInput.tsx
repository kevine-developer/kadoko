import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

interface SocialLinkInputProps {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  color?: string;
}

const SocialLinkInput = ({
  icon,
  placeholder,
  value,
  onChangeText,
  color = "#111827",
}: SocialLinkInputProps) => {
  return (
    <View style={styles.container}>
      <View style={[styles.iconBox, { backgroundColor: color + "10" }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );
};

export default SocialLinkInput;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
  },
});
