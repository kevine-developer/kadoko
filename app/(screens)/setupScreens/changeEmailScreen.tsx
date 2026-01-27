import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";

// Hooks & Components
import { authClient } from "@/features/auth";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { ThemedText } from "@/components/themed-text";
import Icon from "@/components/themed-icon";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import SettingsNavBar from "@/components/Settings/SettingsNavBar";

export default function ChangeEmailScreen() {
  const router = useRouter();
  const theme = useAppTheme();

  const [loading, setLoading] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isSent, setIsSent] = useState(false);

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
        setIsSent(true);
        showSuccessToast("Email de vérification envoyé");
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
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* NAV BAR MINIMALISTE */}
        <SettingsNavBar title="Changer mon adresse email" />
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
              <ThemedText type="hero">Nouvelle{"\n"}adresse email.</ThemedText>
              <View
                style={[styles.titleDivider, { backgroundColor: theme.accent }]}
              />
              <ThemedText type="subtitle" colorName="textSecondary">
                Pour garantir la sécurité de votre compte, une vérification sera
                nécessaire sur votre nouvelle boîte de réception.
              </ThemedText>
            </MotiView>

            {/* REGISTRE DES ADRESSES */}
            {!isSent ? (
              <View style={styles.registrySection}>
                <View
                  style={[
                    styles.registryRow,
                    { borderBottomColor: theme.border },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <ThemedText type="label" colorName="textSecondary">
                      ADRESSE ACTUELLE
                    </ThemedText>
                    <ThemedText
                      type="title"
                      style={{ fontSize: 18, marginTop: 4 }}
                    >
                      {currentEmail || "—"}
                    </ThemedText>
                  </View>
                  {session?.user?.emailVerified && (
                    <Icon
                      name="checkmark-circle-outline"
                      size={22}
                      colorName="success"
                    />
                  )}
                </View>

                {!session?.user?.emailVerified && (
                  <TouchableOpacity
                    onPress={handleVerifyCurrentEmail}
                    style={[
                      styles.verifyActionRow,
                      { borderLeftColor: theme.accent },
                    ]}
                    activeOpacity={0.7}
                  >
                    <View style={styles.row}>
                      <Icon
                        name="shield-checkmark-outline"
                        size={18}
                        colorName="accent"
                      />
                      <ThemedText
                        type="label"
                        colorName="accent"
                        style={{ marginLeft: 12 }}
                      >
                        VÉRIFIER MON IDENTITÉ
                      </ThemedText>
                    </View>
                    <Icon name="chevron-forward" size={14} colorName="accent" />
                  </TouchableOpacity>
                )}

                {/* Ligne : Nouvelle (Input) */}
                <View style={styles.inputSection}>
                  <ThemedText type="label" colorName="textSecondary">
                    NOUVELLE DESTINATION
                  </ThemedText>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: theme.textMain,
                        borderBottomColor: theme.accent,
                        fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
                      },
                    ]}
                    placeholder="nom@domaine.com"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={newEmail}
                    onChangeText={setNewEmail}
                    autoCorrect={false}
                    selectionColor={theme.accent}
                  />
                </View>
              </View>
            ) : (
              <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={styles.successCard}
              >
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.accent,
                    },
                  ]}
                >
                  <Icon
                    name="mail-unread-outline"
                    size={40}
                    colorName="accent"
                  />
                </View>

                <ThemedText type="title" style={styles.successTitle}>
                  Lien envoyé !
                </ThemedText>

                <ThemedText
                  type="subtitle"
                  colorName="textSecondary"
                  style={styles.successText}
                >
                  Un email de confirmation a été expédié à{"\n"}
                  <ThemedText
                    type="defaultBold"
                    style={{ color: theme.textMain }}
                  >
                    {newEmail}
                  </ThemedText>
                  .
                </ThemedText>

                <ThemedText
                  type="caption"
                  colorName="textSecondary"
                  style={styles.successHint}
                >
                  Veuillez cliquer sur le lien dans l&apos;email pour valider le
                  changement. Votre adresse actuelle restera active tant que la
                  vérification n&apos;est pas terminée.
                </ThemedText>
              </MotiView>
            )}

            {/* ACTION FOOTER */}
            <View style={styles.footer}>
              {!isSent ? (
                <>
                  <TouchableOpacity
                    style={[
                      styles.primaryBtn,
                      { backgroundColor: theme.textMain },
                      (!newEmail || loading) && { opacity: 0.5 },
                    ]}
                    onPress={handleRequestChange}
                    disabled={loading || !newEmail}
                    activeOpacity={0.9}
                  >
                    {loading ? (
                      <ActivityIndicator
                        color={theme.background}
                        size="small"
                      />
                    ) : (
                      <ThemedText
                        type="label"
                        lightColor="#FFF"
                        darkColor="#000"
                      >
                        Mettre à jour mon profil
                      </ThemedText>
                    )}
                  </TouchableOpacity>

                  <ThemedText
                    type="caption"
                    colorName="textSecondary"
                    style={styles.helperText}
                  >
                    L&apos;adresse sera mise à jour après confirmation.
                  </ThemedText>
                </>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    { backgroundColor: theme.textMain },
                  ]}
                  onPress={() => router.back()}
                  activeOpacity={0.9}
                >
                  <ThemedText type="label" lightColor="#FFF" darkColor="#000">
                    Retour aux réglages
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: { paddingHorizontal: 32, flexGrow: 1 },
  heroSection: { marginTop: 30, marginBottom: 40 },
  titleDivider: { width: 35, height: 2, marginVertical: 25 },
  registrySection: { marginBottom: 40 },
  registryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  inputSection: { marginTop: 30 },
  input: {
    fontSize: 22,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  footer: { marginTop: "auto", paddingBottom: 30 },
  primaryBtn: {
    height: 60,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  helperText: { marginTop: 15, textAlign: "center" },
  row: { flexDirection: "row", alignItems: "center" },
  verifyActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(175, 144, 98, 0.05)",
    padding: 15,
    marginTop: 10,
    borderLeftWidth: 2,
  },
  successCard: {
    alignItems: "center",
    paddingVertical: 20,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 25,
  },
  successTitle: {
    fontSize: 24,
    marginBottom: 15,
  },
  successText: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  successHint: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
});
