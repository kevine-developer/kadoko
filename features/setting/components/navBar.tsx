import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";
import { ThemedText } from "@/components/themed-text";

interface NavBarProps {
  title: string;
  onPress?: () => void;
  isSaving?: boolean;
  showBorder?: boolean; // Option pour une ligne de séparation fine
}

const NavBar = ({
  title,
  onPress,
  isSaving,
  showBorder = false,
}: NavBarProps) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useAppTheme();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleAction = () => {
    if (onPress && !isSaving) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onPress();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 10,
          backgroundColor: theme.background,
          borderBottomWidth: showBorder ? StyleSheet.hairlineWidth : 0,
          borderBottomColor: theme.border,
        },
      ]}
    >
      {/* BOUTON RETOUR */}
      <TouchableOpacity
        onPress={handleBack}
        style={styles.navBtn}
        activeOpacity={0.6}
      >
        <ThemedIcon name="chevron-back" size={24} color={theme.textMain} />
      </TouchableOpacity>

      {/* TITRE CENTRAL */}
      <View style={styles.titleContainer}>
        <ThemedText
          type="label"
          colorName="textMain"
          numberOfLines={1}
          style={styles.titleText}
        >
          {title}
        </ThemedText>
      </View>

      {/* ACTION DROITE */}
      <View style={styles.actionContainer}>
        {onPress ? (
          <TouchableOpacity
            onPress={handleAction}
            disabled={isSaving}
            activeOpacity={0.6}
            style={styles.saveAction}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={theme.accent} />
            ) : (
              <ThemedText
                type="label"
                colorName="accent"
                style={styles.actionText}
              >
                OK
              </ThemedText>
            )}
          </TouchableOpacity>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>
    </View>
  );
};

export default NavBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingBottom: 15,
    zIndex: 100,
  },
  navBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  titleText: {
    fontSize: 10, // Petit et espacé pour le look luxe
    letterSpacing: 2,
    fontWeight: "800",
  },
  actionContainer: {
    width: 44,
    alignItems: "flex-end",
  },
  saveAction: {
    height: 44,
    justifyContent: "center",
    minWidth: 44,
    alignItems: "flex-end",
  },
  actionText: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
});
