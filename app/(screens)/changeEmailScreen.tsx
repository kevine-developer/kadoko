import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { authClient } from "@/features/auth";

// --- THEME ÉDITORIAL ---
const THEME = {
  background: "#FDFBF7", // Bone Silk
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  primary: "#1A1A1A",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.08)",
  success: "#4A6741", // Vert forêt (plus luxe que le vert flash)
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
      showErrorToast("Veuillez saisir une adresse");
      return;
    }

    if (newEmail.toLowerCase() === currentEmail?.toLowerCase()) {
      showErrorToast("L'adresse doit être différente");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      showErrorToast("Format d'email invalide");
      return;
    }

    setLoading(true);
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { error } = await authClient.changeEmail({
        newEmail,
        callbackURL: "/(screens)/verifyEmailScreen",
      });

      if (error) {
        showErrorToast(error.message || "Erreur lors de la demande");
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showSuccessToast("Code de vérification envoyé");
        router.push({
          pathname: "/(screens)/verifyEmailScreen",
          params: { email: newEmail, type: "change-email" },
        });
      }
    } catch {
      showErrorToast("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCurrentEmail = async () => {
    if (!currentEmail || loading) return;
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: currentEmail,
        type: "email-verification",
      });

      if (error) {
        showErrorToast(error.message || "Erreur lors de l'envoi");
      } else {
        showSuccessToast("Code de vérification envoyé");
        router.push({
          pathname: "/(screens)/verifyEmailScreen",
          params: { email: currentEmail, type: "verify" },
        });
      }
    } catch {
      showErrorToast("Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* NAV BAR MINIMALISTE */}
        <View style={[styles.navBar, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={24} color={THEME.textMain} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>COORDONNÉES</Text>
          <View style={{ width: 44 }} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* HERO SECTION */}
            <MotiView
              from={{ opacity: 0, translateY: 15 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 700 }}
              style={styles.heroSection}
            >
              <Text style={styles.heroTitle}>Nouvelle{"\n"}adresse email.</Text>
              <View style={styles.titleDivider} />
              <Text style={styles.heroSubtitle}>
                Pour garantir la sécurité de votre compte, une vérification sera
                nécessaire sur votre nouvelle boîte de réception.
              </Text>
            </MotiView>

            {/* REGISTRE DES ADRESSES */}
            <View style={styles.registrySection}>
              <View style={styles.registryRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.registryLabel}>ADRESSE ACTUELLE</Text>
                  <Text style={styles.registryValue}>
                    {currentEmail || "—"}
                  </Text>
                </View>
                {session?.user?.emailVerified && (
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color={THEME.success}
                  />
                )}
              </View>

              {!session?.user?.emailVerified && (
                <TouchableOpacity
                  onPress={handleVerifyCurrentEmail}
                  style={styles.verifyActionRow}
                  activeOpacity={0.7}
                >
                  <View style={styles.row}>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={18}
                      color={THEME.accent}
                    />
                    <Text style={styles.verifyActionText}>
                      VÉRIFIER MON IDENTITÉ
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={14}
                    color={THEME.accent}
                  />
                </TouchableOpacity>
              )}

              {/* Ligne : Nouvelle (Input) */}
              <View
                style={[
                  styles.registryRow,
                  { borderBottomWidth: 0, marginTop: 10 },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.registryLabel}>NOUVELLE DESTINATION</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="nom@domaine.com"
                      placeholderTextColor="#BCBCBC"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={newEmail}
                      onChangeText={setNewEmail}
                      autoCorrect={false}
                      selectionColor={THEME.accent}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* ACTION FOOTER */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  (!newEmail || loading) && styles.primaryBtnDisabled,
                ]}
                onPress={handleRequestChange}
                disabled={loading || !newEmail}
                activeOpacity={0.9}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.primaryBtnText}>
                    Mettre à jour mon profil
                  </Text>
                )}
              </TouchableOpacity>

              <Text style={styles.helperText}>
                Un code de confirmation sera envoyé instantanément.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },

  /* NAV BAR */
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  navTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.textMain,
    letterSpacing: 2,
  },

  scrollContent: {
    paddingHorizontal: 30,
    flexGrow: 1,
  },

  /* HERO */
  heroSection: {
    marginTop: 30,
    marginBottom: 40,
  },
  heroTitle: {
    fontSize: 38,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    lineHeight: 44,
    letterSpacing: -1,
  },
  titleDivider: {
    width: 35,
    height: 2,
    backgroundColor: THEME.accent,
    marginVertical: 25,
  },
  heroSubtitle: {
    fontSize: 15,
    color: THEME.textSecondary,
    lineHeight: 24,
    fontStyle: "italic",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },

  /* REGISTRY SECTION */
  registrySection: {
    marginBottom: 40,
  },
  registryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  registryLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  registryValue: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.textMain,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },

  /* INPUT */
  inputWrapper: {
    width: "100%",
    marginTop: 5,
  },
  input: {
    fontSize: 22,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.accent, // Ligne dorée pour l'input actif
  },

  /* FOOTER & BUTTON */
  footer: {
    marginTop: "auto",
    paddingBottom: 30,
  },
  primaryBtn: {
    backgroundColor: THEME.primary,
    height: 60,
    borderRadius: 0, // Rectangulaire luxe
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnDisabled: {
    backgroundColor: "#E5E7EB",
    opacity: 0.6,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  helperText: {
    marginTop: 15,
    fontSize: 11,
    color: THEME.textSecondary,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  row: { flexDirection: "row", alignItems: "center" },
  verifyActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(175, 144, 98, 0.05)",
    padding: 15,
    marginTop: 10,
    borderLeftWidth: 2,
    borderLeftColor: THEME.accent,
  },
  verifyActionText: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.accent,
    letterSpacing: 1,
    marginLeft: 12,
  },
});
