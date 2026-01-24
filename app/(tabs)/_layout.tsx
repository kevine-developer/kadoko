import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HapticTab } from "@/components/haptic-tab";
import * as Haptics from "expo-haptics";
import { NotificationBadge } from "@/components/notifications/NotificationBadge";

// --- THEME ÉDITORIAL ---
const THEME = {
  background: "#FDFBF7",
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.08)",
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarActiveTintColor: THEME.textMain,
        tabBarInactiveTintColor: THEME.textSecondary,
        // ✅ 1. Structure de la barre
        tabBarStyle: [
          styles.tabBarBase,
          {
            bottom: Platform.OS === "ios" ? insets.bottom + 10 : 20,
          },
        ],
        // ✅ 2. FORCE CHAQUE ONGLET À AVOIR LA MÊME LARGEUR (20%)
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

      {/* BOUTON CENTRAL */}
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
 * 💎 BOUTON CENTRAL "TOTEM" PARFAITEMENT CENTRÉ
 */
const CentralTabButton = (props: any) => {
  const { onPress, accessibilityState } = props;
  const focused = accessibilityState?.selected;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress?.();
  };

  return (
    <View style={styles.centralButtonContainer}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.9}
        style={styles.centralTouchArea}
      >
        <View style={[styles.diamondShape, focused && styles.diamondFocused]}>
          {/* On contre-pivote l'icône pour qu'elle reste droite */}
          <View style={{ transform: [{ rotate: "-45deg" }] }}>
            <Ionicons
              name="sparkles"
              size={24}
              color={focused ? THEME.accent : "#FFFFFF"}
            />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const TabIcon = ({ focused, color, iconName, label }: any) => {
  return (
    <View style={styles.iconContainer}>
      <Ionicons
        size={20}
        name={iconName}
        color={focused ? THEME.textMain : color}
      />
      {focused && <View style={styles.activeDot} />}
      <Text
        style={[
          styles.label,
          { color: focused ? THEME.textMain : THEME.textSecondary },
        ]}
      >
        {label}
      </Text>
      {label === "NOTIF" && <NotificationBadge />}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarBase: {
    position: "absolute",
    height: 70,
    backgroundColor: THEME.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 0, // On retire l'elevation par défaut pour gérer l'ombre manuellement
  },

  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
    height: "100%",
    width: 100,
  },
  activeDot: {
    position: "absolute",
    top: 8,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: THEME.accent,
  },
  label: {
    fontSize: 8,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 6,
  },

  /* --- CORRECTIFS BOUTON CENTRAL --- */
  centralButtonContainer: {
    // Ce conteneur prend la place de l'onglet (flex: 1 grâce au tabBarItemStyle parent)
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  centralTouchArea: {
    top: -25, // On le fait sortir vers le haut
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#1A1A1A",
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
    borderRadius: 12, // Légèrement arrondi pour adoucir le losange
    backgroundColor: "#1A1A1A", // Noir profond
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    transform: [{ rotate: "45deg" }], // Rotation Losange
  },
  diamondFocused: {
    borderColor: THEME.accent,
    shadowColor: THEME.accent,
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
});
