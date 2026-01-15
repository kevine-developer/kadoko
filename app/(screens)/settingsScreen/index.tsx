import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// --- THEME ---
const THEME = {
  background: "#FDFBF7", // Blanc cassé "Bone"
  surface: "#FFFFFF",
  textMain: "#111827",
  textSecondary: "#6B7280",
  primary: "#111827",
  border: "rgba(0,0,0,0.06)",
  danger: "#EF4444",
};

// --- TYPES & COMPOSANTS REUTILISABLES ---

// 1. Section Header
const SectionHeader = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionHeaderText}>{title}</Text>
  </View>
);

// 2. Setting Item (Navigation)
const SettingItem = ({
  icon,
  label,
  value,
  onPress,
  isDanger = false,
  isLast = false,
}: any) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.itemContainer, isLast && styles.itemLast]}
    >
      <View style={styles.itemIconBox}>
        <Ionicons
          name={icon}
          size={20}
          color={isDanger ? THEME.danger : THEME.textMain}
        />
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemLabel, isDanger && styles.textDanger]}>
          {label}
        </Text>
        {value && <Text style={styles.itemValue}>{value}</Text>}
      </View>
      {!value && !isDanger && (
        <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
      )}
    </TouchableOpacity>
  );
};

// 3. Setting Switch (Toggle)
const SettingSwitch = ({ icon, label, value, onValueChange, isLast = false }: any) => {
  return (
    <View style={[styles.itemContainer, isLast && styles.itemLast]}>
      <View style={styles.itemIconBox}>
        <Ionicons name={icon} size={20} color={THEME.textMain} />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#E5E7EB", true: THEME.primary }}
        thumbColor={"#FFFFFF"}
        ios_backgroundColor="#E5E7EB"
        style={{ transform: [{ scale: 0.8 }] }}
      />
    </View>
  );
};

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  // États simulés
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Animation Header
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Se déconnecter", style: "destructive", onPress: () => console.log("Logout") },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />

      {/* NAVBAR FLOTTANTE (Apparition au scroll) */}
      <Animated.View
        style={[
          styles.navbar,
          { paddingTop: insets.top, opacity: headerOpacity, height: 50 + insets.top },
        ]}
      >
        <Text style={styles.navTitle}>Paramètres</Text>
      </Animated.View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: 40,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* HEADER TITRE */}
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Paramètres</Text>
        </View>

        {/* 1. CARTE PROFIL */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push("/profile")}
          style={styles.profileCard}
        >
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop" }}
            style={styles.avatar}
            contentFit="cover"
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Thomas Anderson</Text>
            <Text style={styles.profileEmail}>thomas.anderson@matrix.com</Text>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>MEMBRE PREMIUM</Text>
            </View>
          </View>
          <Ionicons name="create-outline" size={20} color={THEME.textSecondary} />
        </TouchableOpacity>

        {/* 2. SECTION COMPTE */}
        <SectionHeader title="Mon Compte" />
        <View style={styles.sectionGroup}>
          <SettingItem
            icon="person-outline"
            label="Informations personnelles"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="shield-checkmark-outline"
            label="Sécurité & Mot de passe"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="card-outline"
            label="Abonnement & Facturation"
            value="Actif"
            onPress={() => {}}
            isLast
          />
        </View>

        {/* 3. SECTION PREFERENCES */}
        <SectionHeader title="Préférences" />
        <View style={styles.sectionGroup}>
          <SettingSwitch
            icon="notifications-outline"
            label="Notifications Push"
            value={notifications}
            onValueChange={setNotifications}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="language-outline"
            label="Langue"
            value="Français"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingSwitch
            icon="moon-outline"
            label="Mode Sombre"
            value={darkMode}
            onValueChange={setDarkMode}
            isLast
          />
        </View>

        {/* 4. SECTION SUPPORT */}
        <SectionHeader title="Support" />
        <View style={styles.sectionGroup}>
          <SettingItem
            icon="help-buoy-outline"
            label="Centre d'aide"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="document-text-outline"
            label="Conditions d'utilisation"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="star-outline"
            label="Noter l'application"
            onPress={() => {}}
            isLast
          />
        </View>

        {/* 5. ZONE DANGER & DECONNEXION */}
        <View style={styles.footerContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Se déconnecter</Text>
            <Ionicons name="log-out-outline" size={18} color={THEME.textMain} />
          </TouchableOpacity>
          
          <Text style={styles.versionText}>Version 2.4.0 (Build 102)</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  
  /* NAVBAR (Sticky) */
  navbar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: "rgba(253, 251, 247, 0.95)", // Fond "Bone" semi-transparent
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  navTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.textMain,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  /* HEADER */
  headerTitleContainer: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "400",
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: THEME.textMain,
    letterSpacing: -0.5,
  },

  /* PROFILE CARD */
  profileCard: {
    backgroundColor: THEME.surface,
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    // Ombre diffuse
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F3F4F6",
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.textMain,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 13,
    color: THEME.textSecondary,
    marginBottom: 8,
  },
  badgeContainer: {
    backgroundColor: "#F3F4F6",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: THEME.textMain,
    letterSpacing: 0.5,
  },

  /* SECTION GROUPS */
  sectionHeader: {
    marginBottom: 12,
    paddingLeft: 8,
  },
  sectionHeaderText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  sectionGroup: {
    backgroundColor: THEME.surface,
    borderRadius: 20,
    marginBottom: 32,
    // Ombre légère
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginLeft: 56, // Alignement avec le texte (sauter l'icône)
  },

  /* ITEMS */
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  itemLast: {
    // Si besoin de style spécifique pour le dernier item
  },
  itemIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  itemContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 8,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: THEME.textMain,
  },
  itemValue: {
    fontSize: 14,
    color: THEME.textSecondary,
  },
  textDanger: {
    color: THEME.danger,
  },

  /* FOOTER */
  footerContainer: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: THEME.surface,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.textMain,
  },
  versionText: {
    fontSize: 12,
    color: "#D1D5DB",
  },
});