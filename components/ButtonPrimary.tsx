import { StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import { ThemedText } from "./themed-text";

interface ButtonPrimaryProps {
  onPress: () => void;
  title: string;
}

const ButtonPrimary = ({ onPress, title }: ButtonPrimaryProps) => {
  const theme = useAppTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.actionBtn, { backgroundColor: theme.textMain }]}
      activeOpacity={0.9}
    >
      <ThemedText
        type="label"
        style={[styles.btnText, { color: theme.background }]}
      >
        {title}
      </ThemedText>
    </TouchableOpacity>
  );
};

export default ButtonPrimary;

const styles = StyleSheet.create({
  actionBtn: {
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 0,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    
  },
  btnText: {
    letterSpacing: 1.5,
  },});
