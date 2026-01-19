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
import { authService } from "../../lib/auth/auth-service";
import { showErrorToast, showSuccessToast } from "../../lib/toast";
import InputCustom from "@/components/auth/input-custom";
import HeaderAuth from "@/components/auth/headerAuth";
import FooterAuth from "@/components/auth/footerAuth";
import BtnSocial from "@/components/auth/btnSocial";
import DividerConnect from "@/components/auth/dividerConnect";
import LayoutAuth from "@/components/auth/LayoutAuth";

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

  const handleLogin = async () => {
    // Validation basique
    if (!email || !password) {
      showErrorToast("Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.signIn({
        email: email.trim(),
        password,
      });

      if (response.success) {
        showSuccessToast(response.message);
        // Redirection vers l'écran principal
        router.replace("/(tabs)");
      } else {
        showErrorToast(response.message || "Erreur de connexion");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      showErrorToast("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Login avec ${provider}`);
  };

  return (
    <LayoutAuth>
      {/* Titre */}
      <HeaderAuth title="Connectez-vous." subtitle="BON RETOUR" />
      {/* Champs de saisie */}
      <View style={styles.inputGroup}>
        {/* Email */}

        <InputCustom
          icon="mail-outline"
          placeholder="Adresse email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Mot de passe */}
        <InputCustom
          icon="lock-closed-outline"
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          showPassword={() => setShowPassword(!showPassword)}
        />

        <TouchableOpacity style={styles.forgotBtn}>
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
