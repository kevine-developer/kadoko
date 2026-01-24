import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Image,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { authClient } from "@/features/auth";
import SettingRow from "@/components/Settings/SettingRow";

const THEME = {
  background: "#FDFBF7",
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  primary: "#1A1A1A",
  accent: "#AF9062",
  border: "rgba(0,0,0,0.06)",
  danger: "#C34A4A",
};

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: session } = authClient.useSession();
  const user = session?.user as any;

  const [isPublic, setIsPublic] = useState(user?.isPublic ?? true);

  useEffect(() => {
    if (user?.isPublic !== undefined) setIsPublic(user.isPublic);
  }, [user?.isPublic]);

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Déconnexion", "Souhaitez-vous quitter votre session ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Se déconnecter",
        style: "destructive",
        onPress: async () => {
          await authClient.signOut();
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  };

  const openLink = (url: string, title: string) => {
    router.push({
      pathname: "/(screens)/webviewScreen",
      params: { url, title },
    });
  };

  return (
    <View style={styles.container}>
      {/* HEADER ÉDITORIAL */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Ionicons name="chevron-back" size={26} color={THEME.textMain} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>PRÉFÉRENCES</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TITRE HERO */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={styles.heroSection}
        >
          <Text style={styles.heroTitle}>Paramètres.</Text>
          <View style={styles.titleDivider} />
        </MotiView>

        {/* CARTE PROFIL LUXE */}
        <TouchableOpacity
          style={styles.profileCard}
          activeOpacity={0.8}
          onPress={() => router.push("/(screens)/nameSetupScreen")}
        >
          <Image
            source={{ uri: user?.image || "https://i.pravatar.cc/150" }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name || "Membre"}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.editLink}>
              <Text style={styles.editLinkText}>Gérer le profil</Text>
              <Ionicons name="arrow-forward" size={10} color={THEME.accent} />
            </View>
          </View>
        </TouchableOpacity>

        {/* SECTIONS EN MODE REGISTRE */}
        <SettingsSection title="Compte">
          <SettingRow
            label="Nom d'utilisateur"
            subLabel={user?.username ? `@${user.username}` : "Non défini"}
            icon="at-outline"
            onPress={() => router.push("/(screens)/usernameSetupScreen")}
          />
          <SettingRow
            label="Biographie"
            subLabel={user?.description || "Votre essence en quelques mots"}
            icon="document-text-outline"
            onPress={() => router.push("/(screens)/bioSetupScreen")}
          />
          <SettingRow
            label="Anniversaire"
            subLabel={
              user?.birthday
                ? new Date(user.birthday).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                  })
                : "Non défini"
            }
            icon="calendar-outline"
            onPress={() => router.push("/(screens)/birthdaySetupScreen")}
          />
          <SettingRow
            label="Me connaître"
            subLabel="Tailles et préférences intimes"
            icon="heart-outline"
            onPress={() => router.push("/(screens)/privateInfoScreen")}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Sécurité">
          <SettingRow
            label="Email"
            subLabel={user?.email}
            icon="mail-outline"
            onPress={() => router.push("/(screens)/changeEmailScreen")}
            badge={!user?.emailVerified ? "À VÉRIFIER" : undefined}
            badgeColor={!user?.emailVerified ? THEME.accent : undefined}
          />
          <SettingRow
            label="Mot de passe"
            icon="key-outline"
            onPress={() => router.push("/(screens)/changePasswordScreen")}
          />
          <SettingRow
            label="Profil Public"
            subLabel="Autoriser la découverte de votre profil"
            icon="eye-outline"
            isSwitch
            switchValue={isPublic}
            onSwitchChange={(val: boolean) => setIsPublic(val)}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Données & Aide">
          <SettingRow
            label="Utilisateurs bloqués"
            icon="ban-outline"
            onPress={() => router.push("/(screens)/blockedUsersScreen")}
          />
          <SettingRow
            label="Centre d'aide"
            icon="help-buoy-outline"
            onPress={() => openLink("https://devengalere.fr/aide", "Aide")}
            isLast
          />
        </SettingsSection>

        {/* LOGOUT / DANGER AREA */}
        <View style={styles.dangerZone}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteLink}
            onPress={() => router.push("/(screens)/deleteAccountScreen")}
          >
            <Text style={styles.deleteText}>Clôturer le compte</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>GIFTFLOW — VERSION 1.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const SettingsSection = ({ title, children }: any) => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  navTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.textMain,
    letterSpacing: 2,
  },
  navBtn: { width: 44, height: 44, justifyContent: "center" },

  scrollContent: { paddingHorizontal: 30, paddingBottom: 60 },

  heroSection: { marginTop: 20, marginBottom: 30 },
  heroTitle: {
    fontSize: 38,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    letterSpacing: -1,
  },
  titleDivider: {
    width: 35,
    height: 2,
    backgroundColor: THEME.accent,
    marginTop: 20,
  },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.surface,
    padding: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F9FAFB",
  },
  profileInfo: { flex: 1, marginLeft: 20 },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.textMain,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  userEmail: { fontSize: 13, color: THEME.textSecondary, marginTop: 2 },
  editLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },
  editLinkText: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.accent,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  sectionContainer: { marginBottom: 35 },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  sectionContent: { borderTopWidth: 1, borderTopColor: THEME.border },

  dangerZone: { marginTop: 20, gap: 20, alignItems: "center" },
  logoutBtn: {
    backgroundColor: THEME.textMain,
    width: "100%",
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  deleteLink: { paddingVertical: 10 },
  deleteText: {
    fontSize: 12,
    color: THEME.textSecondary,
    textDecorationLine: "underline",
  },

  footer: { alignItems: "center", marginTop: 40 },
  versionText: {
    fontSize: 9,
    color: "#D1D5DB",
    fontWeight: "700",
    letterSpacing: 2,
  },
});
