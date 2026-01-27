import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "../../themed-icon";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface RegistryAccordionProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const RegistryAccordion = ({
  title,
  icon,
  isOpen,
  onToggle,
  children,
}: RegistryAccordionProps) => {
  const theme = useAppTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Keyboard.dismiss();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  };

  return (
    <View style={[styles.registryBlock, { borderBottomColor: theme.border }]}>
      <TouchableOpacity
        style={styles.registryHeader}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.row}>
          <ThemedIcon name={icon} colorName="accent" />
          <ThemedText type="subtitle" style={styles.registryTitle}>
            {title}
          </ThemedText>
        </View>
        <ThemedIcon
          name={isOpen ? "remove" : "add"}
          size={20}
          colorName="textSecondary"
        />
      </TouchableOpacity>

      {isOpen && <View style={styles.registryContent}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  registryBlock: {
    borderBottomWidth: 1,
  },
  registryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 25,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  registryTitle: {
    fontSize: 18,
  },
  registryContent: {
    paddingBottom: 30,
  },
});
