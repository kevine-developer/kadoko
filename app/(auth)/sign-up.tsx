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
import HeaderAuth from "@/components/auth/headerAuth";
import InputCustom from "@/components/auth/input-custom";
import DividerConnect from "@/components/auth/dividerConnect";
import BtnSocial from "@/components/auth/btnSocial";
import FooterAuth from "@/components/auth/footerAuth";
import LegalModal from "@/components/auth/LegalModal";
import LayoutAuth from "@/components/auth/LayoutAuth";
import { FormError } from "@/components/auth/FormError";

// --- THEME LUXE ---
const THEME = {
  background: "#FDFBF7",
  surface: "#FFFFFF",
  textMain: "#111827",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  primary: "#111827",
  inputBg: "#FFFFFF",
};

export default function SignUp() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // États du formulaire
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});

  const validate = () => {
    let newErrors: { name?: string; email?: string; password?: string } = {};
    setServerError(null);

    if (!fullName.trim()) newErrors.name = "Le nom est requis";
    if (!email.trim()) newErrors.email = "L'adresse email est requise";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Adresse email invalide";

    if (!password) newErrors.password = "Le mot de passe est requis";
    else if (password.length < 8)
      newErrors.password = "Au moins 8 caractères requis";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // États pour la Modal Juridique
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [legalConfig, setLegalConfig] = useState({ url: "", title: "" });

  const handleOpenLegal = (type: "TERMS" | "PRIVACY") => {
    if (type === "TERMS") {
      setLegalConfig({
        title: "Conditions d'utilisation",
        url: "https://devengalere.fr/conditions-utilisation/", // Remplace par ton URL
      });
    } else {
      setLegalConfig({
        title: "Politique de confidentialité",
        url: "https://devengalere.fr/politique-confidentialite/", // Remplace par ton URL
      });
    }
    setLegalModalVisible(true);
  };

  const handleSignUp = async () => {
    // Validation basique
    if (!validate()) return;

    if (!agreedToTerms) {
      showErrorToast("Veuillez accepter les conditions d'utilisation");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.signUp({
        email: email.trim(),
        password,
        name: fullName.trim(),
      });

      if (response.success) {
        showSuccessToast(response.message || "Inscription réussie !");
        // Redirection vers l'écran de vérification OTP
        router.push({
          pathname: "/(auth)/verify-otp",
          params: { email: email.trim() },
        });
      } else {
        setServerError(response.message || "Erreur lors de l'inscription");
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
      console.log(`Inscription avec ${provider} non implémentée`);
    }
  };

  return (
    <>
      <LayoutAuth>
        {/* Titre */}
        <HeaderAuth title="Rejoignez le cercle." subtitle="NOUVEAU MEMBRE" />

        <FormError message={serverError} />

        <View style={styles.inputGroup}>
          {/* Nom */}
          <InputCustom
            icon="person-outline"
            placeholder="Nom complet"
            value={fullName}
            onChangeText={(t) => {
              setFullName(t);
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            error={errors.name}
          />

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
            placeholder="Créer un mot de passe"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (errors.password)
                setErrors({ ...errors, password: undefined });
            }}
            secureTextEntry={!showPassword}
            showPassword={() => setShowPassword(!showPassword)}
            error={errors.password}
          />
        </View>

        {/* --- CHECKBOX & LIENS WEBVIEW --- */}
        <View style={styles.termsRow}>
          <TouchableOpacity
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}
          >
            {agreedToTerms && (
              <Ionicons name="checkmark" size={12} color="#FFF" />
            )}
          </TouchableOpacity>

          <Text style={styles.termsText}>
            J&apos;accepte les &nbsp;
            <Text
              style={styles.termsLink}
              onPress={() => handleOpenLegal("TERMS")}
            >
              Conditions d&apos;utilisation
            </Text>
            &nbsp; et la &nbsp;
            <Text
              style={styles.termsLink}
              onPress={() => handleOpenLegal("PRIVACY")}
            >
              Politique de confidentialité
            </Text>
            .
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, isLoading && styles.primaryBtnDisabled]}
          activeOpacity={0.9}
          onPress={handleSignUp}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Text style={styles.primaryBtnText}>Créer mon compte</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </>
          )}
        </TouchableOpacity>

        {/* Séparateur */}
        <DividerConnect text="OU S'INSCRIRE AVEC" />

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
          textIntro="Déjà membre ?"
          textLink="Se connecter"
          link="/sign-in"
        />
      </LayoutAuth>

      {/* MODAL JURIDIQUE */}
      <LegalModal
        visible={legalModalVisible}
        onClose={() => setLegalModalVisible(false)}
        url={legalConfig.url}
        title={legalConfig.title}
      />
    </>
  );
}

const styles = StyleSheet.create({
  /* INPUTS */
  inputGroup: {
    gap: 16,
    marginBottom: 24,
  },

  /* TERMS (CHECKBOX + LINKS) */
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#9CA3AF",
    marginRight: 12,
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: THEME.textMain,
    borderColor: THEME.textMain,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: THEME.textSecondary,
    lineHeight: 20,
  },
  termsLink: {
    fontWeight: "700",
    color: THEME.textMain,
    textDecorationLine: "underline",
  },

  /* BUTTONS */
  primaryBtn: {
    backgroundColor: THEME.primary,
    height: 56,
    borderRadius: 28,
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
  socialRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 40,
  },

  primaryBtnDisabled: {
    opacity: 0.6,
  },
});
