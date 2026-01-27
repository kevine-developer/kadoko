import { StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { ThemedText } from "./themed-text";
import Icon from "@/components/themed-icon";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import { useRouter } from "expo-router";

const AddUserNameNotif = () => {
  const theme = useAppTheme();
  const router = useRouter();
  return (
    <TouchableOpacity
      style={[styles.alertBanner, { borderLeftColor: theme.accent }]}
      onPress={() => router.push("/(screens)/setupScreens/usernameSetupScreen")}
    >
      <Icon name="at-outline" size={16} color={theme.accent} />
      <ThemedText type="label" style={[styles.alertText]}>
        Ajoutez un pseudo pour commencer
      </ThemedText>
      <Icon name="chevron-forward" size={14} color={theme.accent} />
    </TouchableOpacity>
  );
};

export default AddUserNameNotif;

const styles = StyleSheet.create({ alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(175, 144, 98, 0.05)",
    padding: 12,
    borderLeftWidth: 2,
    marginTop: 25,
  },
  alertText: {
    flex: 1,
    marginLeft: 10,
  },});
