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

export default function ChangeEmailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  const { data: session } = authClient.useSession();
  const currentEmail = session?.user?.email;

  const handleRequestChange = async () => {
    if (!newEmail) {
      showErrorToast("Veuillez saisir une adresse email");
      return;
    }

    if (newEmail === currentEmail) {
      showErrorToast("La nouvelle adresse email doit être différente");
      return;
    }

    // Validation basique email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      showErrorToast("Veuillez saisir une adresse email valide");
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      const { error } = await authClient.changeEmail({
        newEmail,
        callbackURL: "/(screens)/verifyEmailScreen",
      });

      if (error) {
        showErrorToast(error.message || "Erreur lors de la demande");
      } else {
        showSuccessToast("Un code de vérification a été envoyé");
        router.push({
          pathname: "/(screens)/verifyEmailScreen",
          params: { email: newEmail, type: "change-email" },
        });
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
        <Text style={styles.headerTitle}>Coordonnées</Text>
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
            <Text style={styles.title}>Changer votre email</Text>
            <Text style={styles.subtitle}>
              Une fois votre nouvelle adresse saisie, nous vous enverrons un
              code de confirmation pour valider le changement.
            </Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.currentEmailBox}>
              <Text style={styles.currentLabel}>EMAIL ACTUEL</Text>
              <Text style={styles.currentValue}>
                {currentEmail || "Chargement..."}
              </Text>
            </View>

            <View
              style={{
                height: 24,
                borderBottomWidth: 1,
                borderBottomColor: THEME.border,
                marginBottom: 24,
              }}
            />

            <InputUI
              label="Nouvel Email"
              placeholder="votre.nom@exemple.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={newEmail}
              onChangeText={setNewEmail}
            />
          </View>

          <View style={{ marginTop: 32 }}>
            <ButtonUI
              title="Recevoir le code"
              onPress={handleRequestChange}
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
  currentEmailBox: {
    padding: 4,
  },
  currentLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#94A3B8",
    letterSpacing: 1,
    marginBottom: 4,
  },
  currentValue: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.textMain,
  },
});
