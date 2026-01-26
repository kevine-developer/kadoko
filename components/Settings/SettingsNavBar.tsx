import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import Icon from "../themed-icon";
import { ThemedText } from "../themed-text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAppTheme } from "@/hooks/custom/use-app-theme";

interface SettingsNavBarProps {
  title: string;
  onPress?: () => void;
  isSaving?: boolean;
}

const SettingsNavBar = ({ title, onPress, isSaving }: SettingsNavBarProps) => {
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
      <TouchableOpacity
        onPress={onPress}
        disabled={isSaving}
        style={styles.saveAction}
      >
        {isSaving ? (
          <ActivityIndicator size="small" color={theme.accent} />
        ) : (
          <ThemedText type="label" colorName="accent">
            OK
          </ThemedText>
        )}
      </TouchableOpacity>
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
  saveAction: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "flex-end",
  },
});
