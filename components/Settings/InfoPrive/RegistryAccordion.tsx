import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Icon from "../../themed-icon";

// Activation de l'animation pour Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// On définit un thème interne ou on peut le passer en props
const THEME = {
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062",
  border: "rgba(0,0,0,0.08)",
};

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
  const handlePress = () => {
    // Feedback tactile
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Fermer le clavier si un input était focus
    Keyboard.dismiss();
    // Animation fluide de l'ouverture
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  };

  return (
    <View style={styles.registryBlock}>
      <TouchableOpacity
        style={styles.registryHeader}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.row}>
          <Icon name={icon} color={THEME.accent} />
          <Text style={styles.registryTitle}>{title}</Text>
        </View>
        <Ionicons
          name={isOpen ? "remove" : "add"}
          size={20}
          color={THEME.textSecondary}
        />
      </TouchableOpacity>

      {isOpen && <View style={styles.registryContent}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  registryBlock: {
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
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
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
  },
  registryContent: {
    paddingBottom: 30,
  },
});
