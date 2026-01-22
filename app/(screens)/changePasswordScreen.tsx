import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authClient } from "@/features/auth";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import InputUI from "@/components/InputUI";
import ButtonUI from "@/components/btn-ui";

const THEME = {
  background: "#FDFBF7",
  surface: "#FFFFFF",
  textMain: "#111827",
  textSecondary: "#6B7280",
  primary: "#111827",
  border: "rgba(0,0,0,0.06)",
};

export default function ChangePasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showErrorToast("Veuillez remplir tous les champs");
      return;
    }

    if (newPassword !== confirmPassword) {
      showErrorToast("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    if (newPassword.length < 8) {
      showErrorToast(
        "Le nouveau mot de passe doit faire au moins 8 caractères",
      );
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      const { error } = await authClient.changePassword({
        newPassword,
        currentPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        showErrorToast(
          error.message || "Erreur lors du changement de mot de passe",
        );
      } else {
        showSuccessToast("Mot de passe mis à jour avec succès");
        router.back();
      }
    } catch (err) {
      showErrorToast("Une erreur est survenue");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Ionicons name="arrow-back" size={24} color={THEME.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sécurité</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.introSection}>
            <Text style={styles.title}>Changer votre mot de passe</Text>
            <Text style={styles.subtitle}>
              Choisissez un mot de passe robuste d&apos;au moins 8 caractères
              pour protéger votre compte.
            </Text>
          </View>

          <View style={styles.formCard}>
            <InputUI
              label="Mot de passe actuel"
              placeholder="••••••••"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />

            <View style={{ height: 20 }} />

            <InputUI
              label="Nouveau mot de passe"
              placeholder="••••••••"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <View style={{ height: 20 }} />

            <InputUI
              label="Confirmer le nouveau mot de passe"
              placeholder="••••••••"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <View style={{ marginTop: 32 }}>
            <ButtonUI
              title="Mettre à jour le mot de passe"
              onPress={handleUpdatePassword}
              loading={loading}
              variant="primary"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    backgroundColor: THEME.background,
    zIndex: 10,
  },
  navBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
  },
  scrollContent: {
    padding: 24,
  },
  introSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: THEME.textMain,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.textSecondary,
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: THEME.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
});
