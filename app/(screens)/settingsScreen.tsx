import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Switch,
  Image,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authClient } from "@/features/auth";
import { userService } from "@/lib/services/user-service";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import DeleteAccountModal from "@/components/Settings/DeleteAccountModal";
import VerifyOtpModal from "@/components/Settings/VerifyOtpModal";
import SettingRow from "@/components/Settings/SettingRow";

// --- THEME ---
const THEME = {
  background: "#FDFBF7",
  surface: "#FFFFFF",
  textMain: "#111827",
  textSecondary: "#6B7280",
  primary: "#111827",
  border: "rgba(0,0,0,0.06)",
  danger: "#EF4444",
};

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: session, refetch } = authClient.useSession();
  const user = session?.user as any;

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showVerifyOtpModal, setShowVerifyOtpModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Settings States
  const [isPublic, setIsPublic] = useState(user?.isPublic ?? true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // --- ACTIONS ---

  const handleUpdateProfile = async (field: string, value: any) => {
    if (field === "isPublic") setIsPublic(value);

    try {
      const res = await userService.updateProfile({ [field]: value });
      if (!res.success) {
        if (field === "isPublic") setIsPublic(!value);
        showErrorToast(res.message || "Erreur maj");
      } else {
        await refetch();
      }
    } catch {
      showErrorToast("Erreur serveur");
    }
  };

  const handleChangeEmail = async () => {
    if (!user?.emailVerified) {
      Alert.alert(
        "Email non vérifié",
        "Souhaitez-vous vérifier votre email actuel ou le modifier ?",
        [
          {
            text: "Modifier",
            onPress: () => router.push("/(screens)/changeEmailScreen"),
          },
          {
            text: "Vérifier maintenance",
            onPress: async () => {
              setIsLoading(true);
              try {
                const res = await authClient.sendVerificationEmail({
                  email: user.email,
                  callbackURL: "/(screens)/verifyEmailScreen",
                });
                if (res.error) {
                  showErrorToast(res.error.message || "Erreur d'envoi");
                } else {
                  showSuccessToast("Code envoyé !");
                  router.push({
                    pathname: "/(screens)/verifyEmailScreen",
                    params: { email: user.email, type: "verification" },
                  });
                }
              } catch {
                showErrorToast("Erreur serveur");
              } finally {
                setIsLoading(false);
              }
            },
          },
          { text: "Annuler", style: "cancel" },
        ],
      );
    } else {
      router.push("/(screens)/changeEmailScreen");
    }
  };

  const handleChangePhone = () => {
    // Logique similaire
    console.log("Naviguer vers ChangePhoneScreen");
  };

  const handleClearCache = () => {
    Alert.alert(
      "Vider le cache ?",
      "Cela libérera de l'espace mais les images devront être rechargées.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Vider",
          onPress: () => showSuccessToast("Cache vidé avec succès"),
        },
      ],
    );
  };

  const handleLogout = async () => {
    Alert.alert("Déconnexion", "Voulez-vous vraiment quitter ?", [
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

  const handleDeleteAccount = async (data: {
    password: string;
    otp?: string;
  }) => {
    setIsDeleting(true);
    try {
      const res = await userService.deleteAccount(data);
      if (res.success) {
        showSuccessToast("Compte supprimé.");
        await authClient.signOut();
        router.replace("/(auth)/sign-in");
      } else {
        showErrorToast(res.message);
      }
    } catch (error: any) {
      showErrorToast(error?.message || "Erreur suppression");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const openLink = (url: string, title: string) => {
    router.push({
      pathname: "/(screens)/webviewScreen",
      params: { url, title },
    });
  };

  return (
    <View style={styles.container}>
      {/* HEADER FIXE */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Ionicons name="arrow-back" size={24} color={THEME.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* CARTE PROFIL */}
        <TouchableOpacity
          style={styles.profileCard}
          activeOpacity={0.9}
          onPress={() => router.push("/(screens)/nameSetupScreen")}
        >
          <Image
            source={{ uri: user?.image || "https://i.pravatar.cc/150" }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name || "Utilisateur"}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeText}>MODIFIER LE PROFIL</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
        </TouchableOpacity>

        {/* --- SECTION INFOS PERSONNELLES --- */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          <View style={styles.sectionCard}>
            <SettingRow
              label="Nom d'utilisateur"
              subLabel={user?.username || "Non défini"}
              icon="at-outline"
              onPress={() => router.push("/(screens)/usernameSetupScreen")}
            />
            <SettingRow
              label="Biographie"
              subLabel={user?.description || "Non défini"}
              icon="person-outline"
              onPress={() => router.push("/(screens)/bioSetupScreen")}
            />
            <SettingRow
              label="Liens sociaux"
              subLabel={
                user?.socialLinks?.length
                  ? `${user.socialLinks.length} lien(s)`
                  : "Aucun lien"
              }
              icon="link-outline"
              onPress={() => router.push("/(screens)/socialLinksScreen")}
            />
            <SettingRow
              label="Me connaître"
              subLabel="Tailles et préférences"
              icon="heart-outline"
              onPress={() => router.push("/(screens)/privateInfoScreen")}
            />
            <SettingRow
              label="Adresse Email"
              subLabel={user?.email}
              icon="mail-outline"
              onPress={() => handleChangeEmail()}
              badge={!user?.emailVerified ? "À VÉRIFIER" : undefined}
              badgeColor={!user?.emailVerified ? "#F59E0B" : undefined}
            />
            <SettingRow
              label="Numéro de mobile"
              subLabel={user?.phoneNumber || "Non défini"}
              icon="call-outline"
              onPress={handleChangePhone}
              isLast
              isComingSoon
            />
          </View>
        </View>

        {/* --- SECTION SÉCURITÉ --- */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Sécurité & Accès</Text>
          <View style={styles.sectionCard}>
            <SettingRow
              label="Mot de passe"
              icon="key-outline"
              onPress={() => router.push("/(screens)/changePasswordScreen")}
            />
            <SettingRow
              label="Face ID / Touch ID"
              icon="finger-print-outline"
              isSwitch
              switchValue={biometricsEnabled}
              onSwitchChange={setBiometricsEnabled}
              isComingSoon
            />
            <SettingRow
              label="Appareils connectés"
              icon="phone-portrait-outline"
              value="2 actifs"
              onPress={() => {}}
              isLast
              isComingSoon
            />
          </View>
        </View>

        {/* --- SECTION PRÉFÉRENCES (NOUVEAU) --- */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Préférences</Text>
          <View style={styles.sectionCard}>
            <SettingRow
              label="Notifications"
              icon="notifications-outline"
              isSwitch
              switchValue={notificationsEnabled}
              onSwitchChange={setNotificationsEnabled}
              isComingSoon
            />
            <SettingRow
              label="Devise"
              icon="wallet-outline"
              value="EUR (€)"
              onPress={() => {}}
              isComingSoon
            />
            <SettingRow
              label="Langue"
              icon="language-outline"
              value="Français"
              onPress={() => {}}
              isComingSoon
            />
            <SettingRow
              label="Profil Public"
              icon="eye-outline"
              isSwitch
              switchValue={isPublic}
              onSwitchChange={(val: boolean) =>
                handleUpdateProfile("isPublic", val)
              }
              isLast
              isComingSoon
            />
          </View>
        </View>

        {/* --- SECTION DONNÉES & CONFIDENTIALITÉ --- */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Données</Text>
          <View style={styles.sectionCard}>
            <SettingRow
              label="Utilisateurs bloqués"
              icon="ban-outline"
              onPress={() => {}}
              isComingSoon
            />
            <SettingRow
              label="Vider le cache"
              icon="refresh-outline"
              value="124 MB"
              onPress={handleClearCache}
              isLast
              isComingSoon
            />
          </View>
        </View>

        {/* --- SECTION INFOS & ASSISTANCE --- */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Légal & Aide</Text>
          <View style={styles.sectionCard}>
            <SettingRow
              label="Centre d'aide"
              icon="help-buoy-outline"
              onPress={() =>
                openLink("https://giftflow.app/help", "Centre d'aide")
              }
            />
            <SettingRow
              label="Conditions d'utilisation"
              icon="document-text-outline"
              onPress={() =>
                openLink("https://giftflow.app/terms", "Conditions")
              }
            />
            <SettingRow
              label="Politique de confidentialité"
              icon="shield-outline"
              onPress={() =>
                openLink("https://giftflow.app/privacy", "Confidentialité")
              }
              isLast
            />
          </View>
        </View>

        {/* --- ZONE DANGER --- */}
        <View style={styles.sectionContainer}>
          <View style={[styles.sectionCard, { backgroundColor: "#FFF" }]}>
            <SettingRow
              label="Se déconnecter"
              icon="log-out-outline"
              onPress={handleLogout}
            />
            <SettingRow
              label="Supprimer le compte"
              icon="trash-outline"
              isDanger
              onPress={() => setShowDeleteModal(true)}
              isLast
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>GiftFlow v1.0.0 (Build 204)</Text>
        </View>
      </ScrollView>

      {/* MODALS */}
      <DeleteAccountModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        isLoading={isDeleting}
        email={user?.email || ""}
        requireOtp={!user?.emailVerified}
        hasPassword={user?.hasPassword ?? true}
      />

      <VerifyOtpModal
        visible={showVerifyOtpModal}
        email={user?.email || ""}
        onClose={() => setShowVerifyOtpModal(false)}
        onVerified={async () => {
          await refetch();
          setShowVerifyOtpModal(false);
        }}
      />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={THEME.textMain} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    backgroundColor: THEME.background,
  },
  navBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
  },

  /* SCROLL CONTENT */
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 60,
  },

  /* PROFILE CARD */
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.surface,
    padding: 16,
    borderRadius: 24,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
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
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: THEME.textMain,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: THEME.textSecondary,
    marginBottom: 8,
  },
  editBadge: {
    backgroundColor: "#F3F4F6",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  editBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: THEME.textMain,
    letterSpacing: 0.5,
  },

  /* SECTIONS */
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 12,
    paddingLeft: 8,
  },
  sectionCard: {
    backgroundColor: THEME.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },

  /* ROW ITEM */
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  labelContainer: {
    flex: 1,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: THEME.textMain,
  },
  rowSubLabel: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowValue: {
    fontSize: 14,
    color: THEME.textSecondary,
  },

  /* FOOTER */
  footer: {
    alignItems: "center",
    marginTop: 20,
  },
  versionText: {
    fontSize: 12,
    color: "#D1D5DB",
    fontWeight: "500",
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  badge: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFF",
  },
});
