import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

// Hooks & Components
import { HapticTab } from "@/components/haptic-tab";
import { NotificationBadge } from "@/components/notifications/NotificationBadge";
import { ThemedText } from "@/components/themed-text";
import Icon from "@/components/themed-icon";
import { useAppTheme } from "@/hooks/custom/use-app-theme";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme(); // Récupération du thème global

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.textMain,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: [
          styles.tabBarBase,
          {
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
            bottom: Platform.OS === "ios" ? insets.bottom + 10 : 20,
          },
        ],
        tabBarItemStyle: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              iconName={focused ? "layers" : "layers-outline"}
              label="FLUX"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="notifications/index"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              iconName={focused ? "notifications" : "notifications-outline"}
              label="NOTIF"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Ephemera/index"
        options={{
          tabBarButton: (props) => <CentralTabButton {...props} />,
        }}
      />

      <Tabs.Screen
        name="UsersListScreen"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              iconName={focused ? "people" : "people-outline"}
              label="CERCLE"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile/index"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              iconName={focused ? "person" : "person-outline"}
              label="MOI"
            />
          ),
        }}
      />
    </Tabs>
  );
}

/**
 * 💎 BOUTON CENTRAL "TOTEM" (LOSANGE)
 */
const CentralTabButton = (props: any) => {
  const { onPress, accessibilityState } = props;
  const focused = accessibilityState?.selected;
  const theme = useAppTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress?.();
  };

  return (
    <View style={styles.centralButtonContainer}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.9}
        style={[
          styles.centralTouchArea,
          { shadowColor: focused ? theme.accent : theme.textMain },
        ]}
      >
        <View
          style={[
            styles.diamondShape,
            {
              backgroundColor: theme.surface,
              borderColor: "rgba(99, 79, 14, 0.1)",
            },
            focused && { borderColor: theme.accent, borderWidth: 1.5 },
          ]}
        >
          {/* Contre-pivote l'icône pour qu'elle reste droite malgré le losange */}
          <View style={{ transform: [{ rotate: "-45deg" }] }}>
            <Icon
              name="sparkles"
              size={24}
              color={focused ? theme.accent : theme.textMain}
            />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

/**
 * ICONES STANDARDS AVEC THEMEDTEXT
 */
const TabIcon = ({ focused, color, iconName, label }: any) => {
  const theme = useAppTheme();

  return (
    <View style={styles.iconContainer}>
      <Icon name={iconName} size={20} color={focused ? theme.accent : color} />
      {focused && (
        <View style={[styles.activeDot, { backgroundColor: theme.accent }]} />
      )}
      <ThemedText
        type="label"
        style={[
          styles.label,
          { color: focused ? theme.accent : theme.textSecondary },
        ]}
      >
        {label}
      </ThemedText>
      {label === "NOTIF" && <NotificationBadge />}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarBase: {
    position: "absolute",
    height: 70,
    borderTopWidth: 1,
    elevation: 0,
    // Ombre de la barre
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
    height: "100%",
  },
  activeDot: {
    position: "absolute",
    top: 8,
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  label: {
    fontSize: 8,
    marginTop: 6,
  },
  centralButtonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  centralTouchArea: {
    top: -25,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  diamondShape: {
    width: 54,
    height: 54,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "45deg" }],
    borderWidth: 1,
  },
});
