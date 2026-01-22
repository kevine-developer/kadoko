import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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

// --- THEME LUXE ---
const THEME = {
  background: "#FDFBF7", // Blanc cassé "Bone"
  surface: "#FFFFFF",
  textMain: "#111827", // Noir profond
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  primary: "#111827",
  inputBg: "#FFFFFF",
};

export default function SignIn() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const validate = () => {
    let newErrors: { email?: string; password?: string } = {};
    setServerError(null); // Clear previous server error on new validation
    if (!email.trim()) newErrors.email = "L'adresse email est requise";
    if (!password) newErrors.password = "Le mot de passe est requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    // Validation basique
    if (!validate()) return;

    setIsLoading(true);

    try {
      const response = await authService.signIn({
        email: email.trim(),
        password,
      });

      if (response.success) {
        router.replace("/");
      } else {
        setServerError(response.message || "Erreur de connexion");
      }
    } catch {
      setServerError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    if (provider === "Google") {
      setIsLoading(true);
      try {
        await authService.signInWithSocial("google");
      } catch {
        setServerError("Erreur de connexion avec Google");
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log(`Login avec ${provider} non implémenté`);
    }
  };

  return (
    <LayoutAuth>
      {/* Titre */}
      <HeaderAuth title="Connectez-vous." subtitle="BON RETOUR" />

      <FormError message={serverError} />

      {/* Champs de saisie */}
      <View style={styles.inputGroup}>
        {/* Email */}

        <InputCustom
          icon="mail-outline"
          placeholder="Adresse email"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            if (errors.email) setErrors({ ...errors, email: undefined });
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        {/* Mot de passe */}
        <InputCustom
          icon="lock-closed-outline"
          placeholder="Mot de passe"
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (errors.password) setErrors({ ...errors, password: undefined });
          }}
          secureTextEntry={!showPassword}
          showPassword={() => setShowPassword(!showPassword)}
          error={errors.password}
        />

        <TouchableOpacity
          style={styles.forgotBtn}
          onPress={() => router.push("/forgot-password")}
        >
          <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
        </TouchableOpacity>
      </View>

      {/* Bouton Connexion */}
      <TouchableOpacity
        style={[styles.primaryBtn, isLoading && styles.primaryBtnDisabled]}
        activeOpacity={0.9}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <>
            <Text style={styles.primaryBtnText}>Accéder à mon espace</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </>
        )}
      </TouchableOpacity>

      {/* Séparateur */}
      <DividerConnect text="OU CONTINUER AVEC" />

      {/* Réseaux Sociaux (Google / Facebook) */}
      <View style={styles.socialRow}>
        <BtnSocial
          icon="logo-google"
          label="Google"
          handleSocialLogin={() => handleSocialLogin("Google")}
        />

        <BtnSocial
          icon="logo-facebook"
          label="Facebook"
          handleSocialLogin={() => handleSocialLogin("Facebook")}
        />
      </View>

      {/* Footer Inscription */}
      <FooterAuth
        textIntro="Pas encore de compte ?"
        textLink="S'inscrire"
        link="/sign-up"
      />
    </LayoutAuth>
  );
}

const styles = StyleSheet.create({
  /* --- INPUTS --- */
  inputGroup: {
    gap: 16,
    marginBottom: 32,
  },

  forgotBtn: {
    alignSelf: "flex-end",
  },
  forgotText: {
    fontSize: 13,
    color: THEME.textSecondary,
    fontWeight: "600",
  },

  /* --- PRIMARY BUTTON --- */
  primaryBtn: {
    backgroundColor: THEME.primary,
    height: 56,
    borderRadius: 28, // Pill shape
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 32,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  /* --- SOCIALS --- */
  socialRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 40,
  },

  /* --- FOOTER --- */

  primaryBtnDisabled: {
    opacity: 0.6,
  },
});
