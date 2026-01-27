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
  HeaderAuth,
  InputCustom,
  DividerConnect,
  BtnSocial,
  FooterAuth,
  LegalModal,
  LayoutAuth,
  FormError,
} from "@/features/auth";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";

// --- THEME ÉDITORIAL ---

const DEFAULT_AVATAR_URL =
  "https://res.cloudinary.com/dhe585mze/image/upload/v1769517597/avatar-default-svgrepo-com_w8fz2f.svg";

export default function SignUp() {
  const router = useRouter();
  const theme = useAppTheme();
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
      // 1. Vérification préalable (Blocage / Existence)
      const checkRes = await authService.checkUserStatus(email.trim());
      if (!checkRes.success) {
        setIsLoading(false);
        setServerError(checkRes.message || "Inscription impossible");
        return;
      }

      // 2. Inscription
      const response = await authService.signUp({
        email: email.trim(),
        password,
        name: fullName.trim(),
        image: DEFAULT_AVATAR_URL,
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
              if (errors.password)
                setErrors({ ...errors, password: undefined });
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
            style={[
              styles.checkbox,
              { backgroundColor: theme.surface, borderColor: theme.border },
              agreedToTerms && {
                backgroundColor: theme.textMain,
                borderColor: theme.textMain,
              },
            ]}
            activeOpacity={0.8}
          >
            {agreedToTerms && (
              <ThemedIcon name="checkmark" size={12} color={theme.background} />
            )}
          </TouchableOpacity>

          <View style={styles.termsTextContainer}>
            <ThemedText type="caption" style={styles.termsBaseText}>
              Je certifie avoir pris connaissance des{" "}
              <ThemedText
                type="caption"
                colorName="accent"
                style={styles.termsLink}
                onPress={() => handleOpenLegal("TERMS")}
              >
                Conditions
              </ThemedText>{" "}
              et de la{" "}
              <ThemedText
                type="caption"
                colorName="accent"
                style={styles.termsLink}
                onPress={() => handleOpenLegal("PRIVACY")}
              >
                Confidentialité
              </ThemedText>
              .
            </ThemedText>
          </View>
        </View>

        {/* Bouton Authority Rectangulaire */}
        <TouchableOpacity
          style={[
            styles.primaryBtn,
            { backgroundColor: theme.textMain },
            isLoading && styles.primaryBtnDisabled,
          ]}
          activeOpacity={0.9}
          onPress={handleSignUp}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={theme.background} />
          ) : (
            <ThemedText
              type="label"
              style={[styles.primaryBtnText, { color: theme.background }]}
            >
              CRÉER MON COMPTE
            </ThemedText>
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
    borderRadius: 0,
    borderWidth: 1,
    marginRight: 15,
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  termsTextContainer: {
    flex: 1,
  },
  termsBaseText: {
    fontStyle: "italic",
  },
  termsLink: {
    textDecorationLine: "none",
    fontStyle: "normal",
  },

  /* PRIMARY BUTTON */
  primaryBtn: {
    height: 60,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  primaryBtnText: {
    fontSize: 13,
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
