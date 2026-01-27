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
        setServerError(response.message || "Identifiants incorrects");
      }
    } catch {
      setServerError("Une erreur système est survenue");
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
      <FormError message={serverError} />

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
});
