import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

// Hooks & Components
import { authClient } from "@/features/auth";
import SettingRow from "@/components/Settings/SettingRow";
import { getApiUrl } from "@/lib/api-config";
import { showErrorToast, showCustomAlert } from "@/lib/toast";
import { ThemedText } from "@/components/themed-text";
import Icon from "@/components/themed-icon";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import SettingsSection from "@/components/Settings/SettingsSection";

interface LinkedAccount {
  provider: string;
  linkedAt: string;
}

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

  const { data: session } = authClient.useSession();
  const user = session?.user as any;

  const [isPublic, setIsPublic] = useState(user?.isPublic ?? true);
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);

  useEffect(() => {
    if (user?.isPublic !== undefined) setIsPublic(user.isPublic);

    const fetchLinkedAccounts = async () => {
      if (!user) return;
      try {
        const res = await authClient.$fetch<{
          success: boolean;
          accounts: LinkedAccount[];
        }>(getApiUrl("/auth/accounts"));
        if (res.data?.success) {
          setLinkedAccounts(res.data.accounts);
        }
      } catch {
        console.log("Error fetching accounts");
      }
    };
    fetchLinkedAccounts();
  }, [user]);

  const performGoogleLink = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/(screens)/settingsScreen",
      });
    } catch {
      showErrorToast("Impossible de lancer la liaison Google");
    }
  };

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    showCustomAlert("Déconnexion", "Souhaitez-vous quitter votre session ?", [
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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* HEADER ÉDITORIAL */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Icon name="chevron-back" size={26} color={theme.textMain} />
        </TouchableOpacity>
        <ThemedText type="label">Paramètres</ThemedText>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={[
            styles.profileCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
          activeOpacity={0.8}
          onPress={() => router.push("/(screens)/setupScreens/nameSetupScreen")}
        >
          <Image
            source={{ uri: user?.image || "https://i.pravatar.cc/150" }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <ThemedText type="title" style={{ fontSize: 18 }}>
              {user?.name || "Membre"}
            </ThemedText>
            <ThemedText colorName="textSecondary" style={{ fontSize: 13 }}>
              {user?.email}
            </ThemedText>
            <View style={styles.editLink}>
              <ThemedText
                type="label"
                colorName="accent"
                style={{ fontSize: 9 }}
              >
                Gérer le profil
              </ThemedText>
              <Icon name="arrow-forward" size={10} colorName="accent" />
            </View>
          </View>
        </TouchableOpacity>

        {/* SECTIONS EN MODE REGISTRE */}
        <SettingsSection title="Compte">
          <SettingRow
            label="Nom d'utilisateur"
            subLabel={user?.username ? `@${user.username}` : "Non défini"}
            icon="at-outline"
            onPress={() =>
              router.push("/(screens)/setupScreens/usernameSetupScreen")
            }
          />
          <SettingRow
            label="Biographie"
            subLabel={user?.description || "Votre essence en quelques mots"}
            icon="document-text-outline"
            onPress={() =>
              router.push("/(screens)/setupScreens/bioSetupScreen")
            }
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
            onPress={() =>
              router.push("/(screens)/setupScreens/birthdaySetupScreen")
            }
          />
          <SettingRow
            label="Connexions"
            icon="link-outline"
            onPress={() =>
              router.push("/(screens)/setupScreens/socialLinksScreen")
            }
          />
          <SettingRow
            label="Me connaître"
            subLabel="Tailles et préférences intimes"
            icon="heart-outline"
            onPress={() =>
              router.push("/(screens)/setupScreens/privateInfoScreen")
            }
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Sécurité">
          <SettingRow
            label="Email"
            subLabel={user?.email}
            icon="mail-outline"
            onPress={() =>
              router.push("/(screens)/setupScreens/changeEmailScreen")
            }
            badge={!user?.emailVerified ? "À VÉRIFIER" : undefined}
            badgeColor={!user?.emailVerified ? theme.accent : undefined}
          />
          <SettingRow
            label="Blocage"
            subLabel="Registre des personnes bloquées"
            icon="person-remove-outline"
            onPress={() =>
              router.push("/(screens)/setupScreens/blockedUsersScreen")
            }
          />
          <SettingRow
            label="Mot de passe"
            icon="key-outline"
            onPress={() =>
              router.push("/(screens)/setupScreens/changePasswordScreen")
            }
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

        <SettingsSection title="Comptes liés">
          <SettingRow
            label="Google"
            subLabel={
              linkedAccounts.some((a) => a.provider === "google")
                ? "Compte synchronisé"
                : "Synchroniser mon compte"
            }
            icon="logo-google"
            onPress={
              linkedAccounts.some((a) => a.provider === "google")
                ? undefined
                : performGoogleLink
            }
            badge={
              linkedAccounts.some((a) => a.provider === "google")
                ? "LIÉ"
                : undefined
            }
            badgeColor={theme.accent}
          />
        </SettingsSection>

        {/* LOGOUT / DANGER AREA */}
        <View style={styles.dangerZone}>
          <TouchableOpacity
            style={[styles.logoutBtn, { backgroundColor: theme.textMain }]}
            onPress={handleLogout}
          >
            <ThemedText type="label" lightColor="#FFF" darkColor="#000">
              Se déconnecter
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteLink}
            onPress={() =>
              router.push("/(screens)/setupScreens/deleteAccountScreen")
            }
          >
            <ThemedText
              type="caption"
              colorName="textSecondary"
              style={{ textDecorationLine: "underline" }}
            >
              Clôturer le compte
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <ThemedText
            type="label"
            colorName="textSecondary"
            style={{ fontSize: 9 }}
          >
            GIFTFLOW — VERSION 1.0
          </ThemedText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  navBtn: { width: 44, height: 44, justifyContent: "center" },
  scrollContent: { paddingHorizontal: 30, paddingBottom: 60 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 0,
    backgroundColor: "#F9FAFB",
  },
  profileInfo: { flex: 1, marginLeft: 20 },
  editLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },

  dangerZone: { marginTop: 20, gap: 20, alignItems: "center" },
  logoutBtn: {
    width: "100%",
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteLink: { paddingVertical: 10 },
  footer: { alignItems: "center", marginTop: 40 },
});
