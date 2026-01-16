import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview"; // N'oublie pas : npx expo install react-native-webview

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

// --- COMPOSANT MODAL WEBVIEW (Interne) ---
const LegalModal = ({
  visible,
  onClose,
  url,
  title,
}: {
  visible: boolean;
  onClose: () => void;
  url: string;
  title: string;
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet" // Donne l'effet "carte empilée" sur iOS
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Header Modal */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={THEME.textMain} />
          </TouchableOpacity>
        </View>

        {/* WebView */}
        <WebView
          source={{ uri: url }}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={THEME.primary} />
            </View>
          )}
          style={{ flex: 1 }}
        />
      </View>
    </Modal>
  );
};

export default function SignUp() {
  const insets = useSafeAreaInsets();
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // États du formulaire
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // États pour la Modal Juridique
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [legalConfig, setLegalConfig] = useState({ url: "", title: "" });

  const handleOpenLegal = (type: "TERMS" | "PRIVACY") => {
    if (type === "TERMS") {
      setLegalConfig({
        title: "Conditions d'utilisation",
        url: "https://example.com/terms", // Remplace par ton URL
      });
    } else {
      setLegalConfig({
        title: "Politique de confidentialité",
        url: "https://example.com/privacy", // Remplace par ton URL
      });
    }
    setLegalModalVisible(true);
  };

  const handleSignUp = async () => {
    if (!agreedToTerms) {
      alert("Veuillez accepter les conditions d'utilisation.");
      return;
    }
    console.log("Inscription lancée pour", fullName);
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Inscription avec ${provider}`);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* 1. IMAGE D'ACCUEIL */}
      <View style={styles.headerImageContainer}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2040&auto=format&fit=crop",
          }}
          style={styles.headerImage}
          contentFit="cover"
          transition={500}
        />
        <View style={styles.overlay} />

        <View style={[styles.brandContainer, { top: insets.top + 20 }]}>
          <Text style={styles.brandText}>
            GIFT<Text style={{ fontStyle: "italic" }}>FLOW</Text>
          </Text>
        </View>
      </View>

      {/* 2. FORMULAIRE */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.formSheet}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.welcomeSubtitle}>NOUVEAU MEMBRE</Text>
              <Text style={styles.welcomeTitle}>Rejoignez le cercle.</Text>
            </View>

            <View style={styles.inputGroup}>
              {/* Nom */}
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#9CA3AF"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Nom complet"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  autoCapitalize="words"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              {/* Email */}
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#9CA3AF"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Adresse email"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* Password */}
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#9CA3AF"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Créer un mot de passe"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* --- CHECKBOX & LIENS WEBVIEW --- */}
            <View style={styles.termsRow}>
              <TouchableOpacity
                onPress={() => setAgreedToTerms(!agreedToTerms)}
                style={[
                  styles.checkbox,
                  agreedToTerms && styles.checkboxChecked,
                ]}
              >
                {agreedToTerms && (
                  <Ionicons name="checkmark" size={12} color="#FFF" />
                )}
              </TouchableOpacity>

              <Text style={styles.termsText}>
                J&apos;accepte les
                <Text
                  style={styles.termsLink}
                  onPress={() => handleOpenLegal("TERMS")}
                >
                  Conditions d&apos;utilisation
                </Text>
                et la
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
              style={styles.primaryBtn}
              activeOpacity={0.9}
              onPress={handleSignUp}
            >
              <Text style={styles.primaryBtnText}>Créer mon compte</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OU S&apos;INSCRIRE AVEC</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity
                style={styles.socialBtn}
                onPress={() => handleSocialLogin("Google")}
              >
                <Ionicons name="logo-google" size={22} color={THEME.textMain} />
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialBtn}
                onPress={() => handleSocialLogin("Facebook")}
              >
                <Ionicons
                  name="logo-facebook"
                  size={22}
                  color={THEME.textMain}
                />
                <Text style={styles.socialText}>Facebook</Text>
              </TouchableOpacity>
            </View>

            <View
              style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}
            >
              <Text style={styles.footerText}>Déjà membre ? </Text>
              <Link href="/sign-in" asChild>
                <TouchableOpacity activeOpacity={0.9}>
                  <Text style={styles.footerLink}>Se connecter</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* MODAL JURIDIQUE */}
      <LegalModal
        visible={legalModalVisible}
        onClose={() => setLegalModalVisible(false)}
        url={legalConfig.url}
        title={legalConfig.title}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  /* HEADER IMAGE */
  headerImageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  brandContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  brandText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 4,
  },

  /* FORM SHEET */
  formSheet: {
    backgroundColor: THEME.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 40,
    minHeight: "60%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },

  /* TEXTS */
  headerTextContainer: {
    marginBottom: 28,
  },
  welcomeSubtitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 2,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  welcomeTitle: {
    fontSize: 36,
    color: THEME.textMain,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    letterSpacing: -0.5,
  },

  /* INPUTS */
  inputGroup: {
    gap: 16,
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.surface,
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: THEME.textMain,
  },
  eyeBtn: {
    padding: 8,
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
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1,
  },
  socialRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 40,
  },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 16,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  socialText: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.textMain,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: THEME.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.primary,
    textDecorationLine: "underline",
  },

  /* MODAL STYLES */
  modalContainer: {
    flex: 1,
    backgroundColor: "#FDFBF7",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFF",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.textMain,
  },
  closeBtn: {
    padding: 4,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
  },
});
