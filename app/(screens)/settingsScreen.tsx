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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authClient } from "@/lib/auth/auth-client";
import { userService } from "@/lib/services/user-service";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import SettingsSection from "@/components/Settings/SettingsSection";
import SettingsRow from "@/components/Settings/SettingsRow";
import DeleteAccountModal from "@/components/Settings/DeleteAccountModal";
import VerifyOtpModal from "@/components/Settings/VerifyOtpModal";

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

  // Form States (Just for Privacy toggle)
  const [isPublic, setIsPublic] = useState(user?.isPublic ?? true);

  // Actions
  const handleUpdateProfile = async (field: string, value: any) => {
    setIsLoading(true);
    try {
      const res = await userService.updateProfile({ [field]: value });
      if (res.success) {
        showSuccessToast("Mis à jour avec succès");
        await refetch();
      } else {
        showErrorToast(res.message || "Erreur lors de la mise à jour");
      }
    } catch {
      showErrorToast("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
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
        showSuccessToast("Votre compte a été supprimé");
        await authClient.signOut();
        router.replace("/(auth)/sign-in");
      } else {
        showErrorToast(res.message);
      }
    } catch (error: any) {
      showErrorToast(error?.message || "Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleConfirmEmail = async () => {
    setIsLoading(true);
    try {
      await authClient.emailOtp.sendVerificationOtp({
        email: user.email,
        type: "email-verification",
      });
      showSuccessToast("Code de vérification envoyé");
      setShowVerifyOtpModal(true);
    } catch {
      showErrorToast("Erreur lors de l'envoi du code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Custom */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Section Profil (Lien vers EditProfile) */}
        <SettingsSection title="Mon Profil" icon="person-outline">
          <SettingsRow
            label="Modifier mon profil"
            description="Photo, Bio, Réseaux sociaux..."
            icon="pencil-outline"
            onPress={() => router.push("/(screens)/editProfileScreen")}
          />
        </SettingsSection>

        {/* Section Confidentialité */}
        <SettingsSection title="Confidentialité" icon="lock-closed-outline">
          <SettingsRow
            label="Profil Public"
            icon="eye-outline"
            type="switch"
            value={isPublic}
            onValueChange={(val) => {
              setIsPublic(val);
              handleUpdateProfile("isPublic", val);
            }}
          />
        </SettingsSection>

        {/* Section Sécurité */}
        <SettingsSection title="Sécurité" icon="shield-checkmark-outline">
          {!user?.emailVerified && (
            <SettingsRow
              label="Confirmer mon mail"
              icon="mail-outline"
              type="value"
              value="Vérification requise"
              onPress={handleConfirmEmail}
            />
          )}
          <SettingsRow
            label="Changer le mot de passe"
            icon="key-outline"
            onPress={() => router.push("/(auth)/verify-otp")}
          />
        </SettingsSection>

        {/* Section Compte */}
        <SettingsSection title="Compte" icon="settings-outline">
          <SettingsRow
            label="Déconnexion"
            icon="log-out-outline"
            onPress={handleLogout}
          />
          <SettingsRow
            label="Supprimer le compte"
            icon="trash-outline"
            type="danger"
            last
            onPress={() => setShowDeleteModal(true)}
          />
        </SettingsSection>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Kadoko Version 1.0.0</Text>
        </View>
      </ScrollView>

      {/* Modal Suppression */}
      <DeleteAccountModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        isLoading={isDeleting}
        email={user?.email || ""}
        requireOtp={!user?.emailVerified}
      />

      <VerifyOtpModal
        visible={showVerifyOtpModal}
        email={user?.email || ""}
        onClose={() => setShowVerifyOtpModal(false)}
        onVerified={async () => {
          await refetch();
        }}
      />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#111827" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFBF7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  scrollContent: {
    paddingVertical: 24,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  versionContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  versionText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  saveSocialsBtn: {
    backgroundColor: "#111827",
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  saveSocialsBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
