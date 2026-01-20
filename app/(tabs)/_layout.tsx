import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, Text, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const styles = React.useMemo(() => createStyles(isDark), [isDark]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarActiveTintColor: isDark ? "#FFFFFF" : "#000000",
        tabBarInactiveTintColor: isDark ? "#6B7280" : "#9CA3AF",

        tabBarStyle: [
          styles.tabBarBase,
          {
            bottom: Platform.OS === "ios" ? insets.bottom + 16 : 24,
            backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
          },
        ],

        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.iconContainer}>
              <View
                style={[
                  styles.iconWrapper,
                  focused && styles.iconWrapperActive,
                  focused && {
                    backgroundColor: isDark
                      ? "rgba(144, 241, 99, 0.15)"
                      : "rgba(70, 229, 105, 0.1)",
                  },
                ]}
              >
                <Ionicons
                  size={22}
                  name={focused ? "layers" : "layers-outline"}
                  color={focused ? "#097e05ff" : color}
                />
              </View>
              {focused && (
                <Text style={[styles.label, { color: "#097e05ff" }]}>Feed</Text>
              )}
            </View>
          ),
        }}
      />

      {/* ACTIVITY */}
      <Tabs.Screen
        name="UsersListScreen"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.iconContainer}>
              <View
                style={[
                  styles.iconWrapper,
                  focused && styles.iconWrapperActive,
                  focused && {
                    backgroundColor: isDark
                      ? "rgba(144, 241, 99, 0.15)"
                      : "rgba(70, 229, 105, 0.1)",
                  },
                ]}
              >
                <Ionicons
                  size={22}
                  name={focused ? "people" : "people-outline"}
                  color={focused ? "#097e05ff" : color}
                />
              </View>
              {focused && (
                <Text style={[styles.label, { color: "#097e05ff" }]}>
                  Cercle
                </Text>
              )}
            </View>
          ),
        }}
      />

      {/* PROFILE */}
      <Tabs.Screen
        name="profile/index"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.iconContainer}>
              <View
                style={[
                  styles.iconWrapper,
                  focused && styles.iconWrapperActive,
                  focused && {
                    backgroundColor: isDark
                      ? "rgba(144, 241, 99, 0.15)"
                      : "rgba(70, 229, 105, 0.1)",
                  },
                ]}
              >
                <Ionicons
                  size={22}
                  name={focused ? "person" : "person-outline"}
                  color={focused ? "#097e05ff" : color}
                />
              </View>
              {focused && (
                <Text style={[styles.label, { color: "#097e05ff" }]}>
                  Profile
                </Text>
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

/* ---------------- STYLES ---------------- */

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    tabBarBase: {
      position: "absolute",
      height: 72,
      borderRadius: 24,
      transform: [{ translateX: 100 }],
      width: "60%",
      borderWidth: 1,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 12,
      elevation: 8,
    },
    tabBarItem: {
      height: 72,
      paddingVertical: 16,
    },
    iconContainer: {
      alignItems: "center",
      justifyContent: "center",
      width: 50,
      gap: 4,
    },
    iconWrapper: {
      width: 35,
      height: 35,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    iconWrapperActive: {
      transform: [{ scale: 1.02 }],
    },
    label: {
      fontSize: 11,
      fontWeight: "600",
      letterSpacing: 0.2,
    },
  });
