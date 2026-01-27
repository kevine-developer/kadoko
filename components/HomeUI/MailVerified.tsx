import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { router } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";

const MailVerified = () => {
  const theme = useAppTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push("/(screens)/settingsScreen")}
      style={[styles.verificationBanner, { borderLeftColor: theme.danger }]}
    >
      <View style={[styles.warningIcon, { backgroundColor: theme.danger }]}>
        <ThemedIcon name="alert" size={14} color="#FFF" />
      </View>
      <ThemedText type="label" style={{ color: theme.danger, flex: 1 }}>
        VÉRIFICATION REQUISE : CONFIRMEZ VOTRE EMAIL
      </ThemedText>
      <ThemedIcon name="arrow-forward" size={14} colorName="danger" />
    </TouchableOpacity>
  );
};

export default MailVerified;

const styles = StyleSheet.create({
  verificationBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  warningIcon: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
});
