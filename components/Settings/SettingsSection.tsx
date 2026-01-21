import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  icon?: keyof typeof Ionicons.glyphMap;
}

const SettingsSection = ({
  title,
  description,
  children,
  icon,
}: SettingsSectionProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={18} color="#111827" />
          </View>
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title.toUpperCase()}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
};

export default SettingsSection;

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6B7280",
    letterSpacing: 1.2,
  },
  description: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 2,
  },
  content: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
});
