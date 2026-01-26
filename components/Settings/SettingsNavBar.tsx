import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import Icon from "../themed-icon";
import { ThemedText } from "../themed-text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAppTheme } from "@/hooks/custom/use-app-theme";

interface SettingsNavBarProps {
  title: string;
}

const SettingsNavBar = ({ title }: SettingsNavBarProps) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useAppTheme();
  return (
    <View style={[styles.navBar, { paddingTop: insets.top + 10 }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Icon name="chevron-back" size={24} color={theme.textMain} />
      </TouchableOpacity>
      <ThemedText type="label" colorName="textMain">
        {title}
      </ThemedText>
      <View style={{ width: 44 }} />
    </View>
  );
};

export default SettingsNavBar;

const styles = StyleSheet.create({
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
});
