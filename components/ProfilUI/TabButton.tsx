import { ThemedText } from "@/components/themed-text";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TabButtonProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  isActive: boolean;
  onPress: () => void;
  count?: number;
}

const COLORS = {
  primary: "#4a2488",
  background: "#FFFFFF",
  surface: "#F3F4F6",
  textMain: "#1F2937",
  textMuted: "#6B7280",
  white: "#FFFFFF",
  border: "#E5E7EB",
};

const TabButton = ({
  label,
  icon,
  isActive,
  onPress,
  count,
}: TabButtonProps) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={onPress}
    style={styles.tabWrapper}
  >
    {isActive ? (
      <LinearGradient
        colors={["rgba(26, 128, 86, 0.91)", "rgba(82, 161, 85, 0.98)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.tab, styles.activeTab]}
      >
        {/* Blobs décoratifs */}
        <View style={styles.blob} />
        <View style={styles.blobSecondary} />

        <View style={styles.tabContent}>
          <View style={styles.tabIconContainer}>
            <LinearGradient
              colors={["rgba(26, 128, 86, 0.91)", "rgba(20, 100, 70, 1)"]}
              style={styles.iconWrapper}
            >
              <Ionicons name={icon} size={14} color="#ffffff" />
            </LinearGradient>
            <ThemedText style={[styles.tabCount, styles.activeTabText]}>
              {count}
            </ThemedText>
          </View>
          <Text style={[styles.tabText, styles.activeTabText]}>{label}</Text>
        </View>
      </LinearGradient>
    ) : (
      <View style={styles.tab}>
        <View style={styles.tabContent}>
          <View style={styles.tabIconContainer}>
            <View style={[styles.iconWrapper, styles.inactiveIconWrapper]}>
              <Ionicons name={icon} size={14} color={COLORS.textMuted} />
            </View>
            <ThemedText style={styles.tabCount}>{count}</ThemedText>
          </View>
          <Text style={styles.tabText}>{label}</Text>
        </View>
      </View>
    )}
  </TouchableOpacity>
);

export default TabButton;

const styles = StyleSheet.create({
  tabWrapper: {
    flex: 1,
  },

  tab: {
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderRadius: 16,
    backgroundColor: "rgba(99, 99, 99, 0.28)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  activeTab: {
    transform: [{ scale: 1.02 }],
  },

  blob: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    top: -30,
    right: -20,
  },

  blobSecondary: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    bottom: -15,
    left: -10,
  },

  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },

  tabIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
    borderRadius: 24,
  },

  iconWrapper: {
    borderRadius: 24,
    padding: 8,
  },

  inactiveIconWrapper: {
    backgroundColor: "rgba(235, 235, 235, 0.56)",
  },

  tabText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textMuted,
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  tabCount: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textMuted,
    letterSpacing: 1,
    textTransform: "uppercase",
    borderRadius: 24,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  activeTabText: {
    color: "#ffffff",
    fontWeight: "800",
  },
});
