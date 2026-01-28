import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import {
  authService,
  InputCustom,
  HeaderAuth,
  FooterAuth,
  FormError,
  BtnSocial,
  DividerConnect,
  LayoutAuth,
} from "@/features/auth";

import { useAppTheme } from "@/hooks/custom/use-app-theme";
import { ThemedText } from "@/components/themed-text";
import ThemedIcon from "@/components/themed-icon";
import { MotiView, AnimatePresence } from "moti";
import { showSuccessToast } from "@/lib/toast";

// --- THEME ÉDITORIAL ---

export default function SignIn() {
  const router = useRouter();
  const theme = useAppTheme();
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const validate = () => {
    let newErrors: { email?: string; password?: string } = {};
    setServerError(null);
    if (!email.trim()) newErrors.email = "L'adresse email est requise";
    if (!password) newErrors.password = "Le mot de passe est requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const response = await authService.signIn({
        email: email.trim(),
        password,
      });

      if (response.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace("/");
      } else {
        if (response.errorCode === "EMAIL_NOT_VERIFIED") {
          setServerError("EMAIL_NOT_VERIFIED");
        } else {
          setServerError(response.message || "Identifiants incorrects");
        }
      }
    } catch {
      setServerError("Une erreur système est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendLink = async () => {
    setIsLoading(true);
    setServerError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const response = await authService.resendVerificationEmail(email.trim());
      if (response.success) {
        showSuccessToast("Nouveau lien envoyé");
        router.push({
          pathname: "/(auth)/verify-email",
          params: { email: email.trim() },
        });
      } else {
        setServerError(response.message);
      }
    } catch {
      setServerError("Erreur de communication");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);
    try {
      if (provider === "Google") {
        await authService.signInWithSocial("google");
      }
    } catch {
      setServerError(`Connexion ${provider} interrompue`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LayoutAuth>
      {/* 1. Header avec signature visuelle */}
      <HeaderAuth title="Connectez-vous." subtitle="BON RETOUR" />

      {/* 2. Gestion des erreurs serveur style "Alerte Discrète" */}
      <AnimatePresence>
        {serverError && serverError !== "EMAIL_NOT_VERIFIED" && (
          <FormError message={serverError} />
        )}

        {serverError === "EMAIL_NOT_VERIFIED" && (
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={[styles.verifyCard, { borderColor: theme.accent }]}
          >
            <View style={styles.verifyHeader}>
              <ThemedIcon
                name="mail-unread-outline"
                size={24}
                colorName="accent"
              />
              <ThemedText type="label" colorName="accent">
                COMPTE NON VERIFIÉ
              </ThemedText>
            </View>
            <ThemedText type="caption" style={styles.verifyText}>
              Votre compte est en attente de validation. Veuillez vérifier vos
              emails.
            </ThemedText>
            <TouchableOpacity
              style={[styles.resendAction, { backgroundColor: theme.accent }]}
              onPress={handleResendLink}
              disabled={isLoading}
            >
              <ThemedText type="label" style={{ color: "white", fontSize: 10 }}>
                RENVOYER LE LIEN DE VÉRIFICATION
              </ThemedText>
            </TouchableOpacity>
          </MotiView>
        )}
      </AnimatePresence>

      {/* 3. Groupe de saisie style "Registre" */}
      <View style={styles.inputGroup}>
        <InputCustom
          label="IDENTIFIANT"
          placeholder="votre@email.com"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            if (errors.email) setErrors({ ...errors, email: undefined });
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        <View>
          <InputCustom
            label="MOT DE PASSE"
            placeholder="••••••••"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (errors.password)
                setErrors({ ...errors, password: undefined });
            }}
            secureTextEntry
            error={errors.password}
          />
          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => router.push("/forgot-password")}
          >
            <ThemedText
              type="label"
              colorName="accent"
              style={styles.forgotText}
            >
              MOT DE PASSE OUBLIÉ ?
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. Bouton d'Action Principal - Style "Authority" */}
      <TouchableOpacity
        style={[
          styles.primaryBtn,
          { backgroundColor: theme.textMain },
          isLoading && styles.primaryBtnDisabled,
        ]}
        activeOpacity={0.9}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={theme.background} />
        ) : (
          <ThemedText
            type="label"
            style={[styles.primaryBtnText, { color: theme.background }]}
          >
            ACCÉDER À MON ESPACE
          </ThemedText>
        )}
      </TouchableOpacity>

      {/* 5. Séparateur & Socials */}
      <DividerConnect text="OU" />

      <View style={styles.socialRow}>
        <BtnSocial
          icon="logo-google"
          label="Google"
          handleSocialLogin={() => handleSocialLogin("Google")}
        />

        <BtnSocial
          icon="logo-facebook"
          label="Facebook"
          handleSocialLogin={() => {}}
          disabled={true}
        />
      </View>

      {/* 6. Footer avec navigation inversée */}
      <FooterAuth
        textIntro="Nouveau parmi nous ?"
        textLink="Créer un compte"
        link="/sign-up"
      />
    </LayoutAuth>
  );
}

const styles = StyleSheet.create({
  /* --- INPUTS --- */
  inputGroup: {
    gap: 10,
    marginBottom: 35,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginTop: -10, // Rapprochement du champ password
    paddingVertical: 10,
  },
  forgotText: {
    fontSize: 9,
    letterSpacing: 1,
  },

  /* --- PRIMARY BUTTON (RECTANGULAR LUXE) --- */
  primaryBtn: {
    height: 60,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    // Suppression des ombres portées pour un look flat plus moderne
  },
  primaryBtnText: {
    fontSize: 13,
    letterSpacing: 1.5,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },

  /* --- SOCIALS --- */
  socialRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 40,
  },

  /* --- VERIFICATION CARD --- */
  verifyCard: {
    borderWidth: 1,
    padding: 20,
    marginBottom: 25,
    backgroundColor: "rgba(175, 144, 98, 0.05)",
    gap: 12,
  },
  verifyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  verifyText: {
    opacity: 0.8,
    lineHeight: 18,
  },
  resendAction: {
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
});
