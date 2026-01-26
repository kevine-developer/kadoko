import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { showErrorToast, showSuccessToast } from "../../lib/toast";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import {
  authService,
  HeaderAuth,
  InputCustom,
  DividerConnect,
  BtnSocial,
  FooterAuth,
  LegalModal,
  LayoutAuth,
  FormError,
} from "@/features/auth";

// --- THEME ÉDITORIAL COHÉRENT ---
const THEME = {
  background: "#FDFBF7", // Bone Silk
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.08)",
  primary: "#1A1A1A",
};

export default function SignUp() {
  const router = useRouter();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [legalConfig, setLegalConfig] = useState({ url: "", title: "" });

  const handleOpenLegal = (type: "TERMS" | "PRIVACY") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (type === "TERMS") {
      setLegalConfig({
        title: "Conditions d'utilisation",
        url: "https://devengalere.fr/conditions-utilisation/",
      });
    } else {
      setLegalConfig({
        title: "Politique de confidentialité",
        url: "https://devengalere.fr/politique-confidentialite/",
      });
    }
    setLegalModalVisible(true);
  };

  const handleSignUp = async () => {
    if (!validate()) return;

    if (!agreedToTerms) {
      showErrorToast("Veuillez accepter les conditions");
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const response = await authService.signUp({
        email: email.trim(),
        password,
        name: fullName.trim(),
      });

      if (response.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showSuccessToast("Bienvenue dans le cercle");
        router.replace("/");
      } else {
        setServerError(response.message || "Échec de l'inscription");
      }
    } catch {
      setServerError("Une erreur système est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <LayoutAuth>
        {/* Header avec signature éditoriale */}
        <HeaderAuth title="Rejoignez le cercle." subtitle="NOUVEAU MEMBRE" />

        <FormError message={serverError} />

        {/* Formulaire style Registre */}
        <View style={styles.inputGroup}>
          <InputCustom
            label="NOM COMPLET"
            placeholder="Votre nom et prénom"
            value={fullName}
            onChangeText={(t) => {
              setFullName(t);
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            error={errors.name}
          />

          <InputCustom
            label="ADRESSE EMAIL"
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

          <InputCustom
            label="SÉCURITÉ"
            placeholder="Créer un mot de passe"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
            secureTextEntry
            error={errors.password}
          />
        </View>

        {/* --- ACCEPTATION DES CONDITIONS (STYLE ÉPURÉ) --- */}
        <View style={styles.termsSection}>
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              setAgreedToTerms(!agreedToTerms);
            }}
            style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}
            activeOpacity={0.8}
          >
            {agreedToTerms && <Ionicons name="checkmark" size={12} color="#FFF" />}
          </TouchableOpacity>

          <View style={styles.termsTextContainer}>
            <Text style={styles.termsBaseText}>
              Je certifie avoir pris connaissance des{" "}
              <Text style={styles.termsLink} onPress={() => handleOpenLegal("TERMS")}>
                Conditions
              </Text>
              {" "}et de la{" "}
              <Text style={styles.termsLink} onPress={() => handleOpenLegal("PRIVACY")}>
                Confidentialité
              </Text>
              .
            </Text>
          </View>
        </View>

        {/* Bouton Authority Rectangulaire */}
        <TouchableOpacity
          style={[styles.primaryBtn, isLoading && styles.primaryBtnDisabled]}
          activeOpacity={0.9}
          onPress={handleSignUp}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.primaryBtnText}>CRÉER MON COMPTE</Text>
          )}
        </TouchableOpacity>

        {/* Séparateur minimaliste */}
        <DividerConnect text="OU" />

        <View style={styles.socialRow}>
          <BtnSocial
            icon="logo-google"
            label="Google"
            handleSocialLogin={() => authService.signInWithSocial("google")}
          />

          <BtnSocial
            icon="logo-facebook"
            label="Facebook"
            handleSocialLogin={() => {}}
            disabled={true}
          />
        </View>

        {/* Footer avec navigation inversée */}
        <FooterAuth
          textIntro="Déjà membre ?"
          textLink="Se connecter"
          link="/sign-in"
        />
      </LayoutAuth>

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
  inputGroup: {
    gap: 10,
    marginBottom: 10,
  },

  /* TERMS & CONDITIONS LUXE */
  termsSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 35,
    paddingHorizontal: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 0, // Carré pour le luxe
    borderWidth: 1,
    borderColor: THEME.border,
    marginRight: 15,
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.surface,
  },
  checkboxChecked: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  termsTextContainer: {
    flex: 1,
  },
  termsBaseText: {
    fontSize: 13,
    color: THEME.textSecondary,
    lineHeight: 20,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontStyle: "italic",
  },
  termsLink: {
    color: THEME.accent,
    fontWeight: "800",
    textDecorationLine: "none", // Plus épuré sans l'underline natif
    fontStyle: "normal",
  },

  /* PRIMARY BUTTON */
  primaryBtn: {
    backgroundColor: THEME.primary,
    height: 60,
    borderRadius: 0, // Authority style (rectangulaire)
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },

  /* SOCIALS */
  socialRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 40,
  },
});