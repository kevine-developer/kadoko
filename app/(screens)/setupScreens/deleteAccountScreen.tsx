import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { MotiView, MotiText } from "moti";

import { userService } from "@/lib/services/user-service";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { authClient } from "@/features/auth";

// --- THEME ÉDITORIAL ---
const THEME = {
  background: "#FDFBF7", // Bone White / Papier
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#707070",
  accent: "#AF9062", // Or brossé (discret)
  border: "rgba(0,0,0,0.08)",
  inputBg: "#FFFFFF",
};

export default function DeleteAccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: session } = authClient.useSession();
  const user = session?.user as any;

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hasPassword = user?.hasPassword ?? true;

  const handleDelete = async () => {
    if (hasPassword && !password) {
      showErrorToast("Mot de passe requis");
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setLoading(true);
    try {
      const res = await userService.deleteAccount({ password });
      if (res.success) {
        showSuccessToast("Compte clôturé");
        await authClient.signOut();
        router.replace("/(auth)/sign-in");
      } else {
        showErrorToast(res.message);
      }
    } catch {
      showErrorToast("Erreur système");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* HEADER MINIMALISTE */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeCircle}
          >
            <Ionicons name="chevron-down" size={24} color={THEME.textMain} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* TITRE ÉDITORIAL */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 800 }}
              style={styles.heroSection}
            >
              <Text style={styles.heroTitle}>Est-ce{"\n"}un adieu ?</Text>
              <View style={styles.titleDivider} />
              <Text style={styles.heroSubtitle}>
                La clôture de votre compte est une action définitive. Toutes vos
                collections précieuses seront effacées de nos registres.
              </Text>
            </MotiView>

            {/* INFO SECTION - STYLE CATALOGUE */}
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 300 }}
              style={styles.infoSection}
            >
              <View style={styles.infoItem}>
                <Text style={styles.infoNumber}>01</Text>
                <View>
                  <Text style={styles.infoLabel}>DÉLAI DE GRÂCE</Text>
                  <Text style={styles.infoValue}>
                    30 jours pour changer d&apos;avis
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoNumber}>02</Text>
                <View>
                  <Text style={styles.infoLabel}>CONFIDENTIALITÉ</Text>
                  <Text style={styles.infoValue}>
                    Profil masqué instantanément
                  </Text>
                </View>
              </View>
            </MotiView>

            {/* FORMULAIRE ÉPURÉ */}
            {hasPassword && (
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 500 }}
                style={styles.formSection}
              >
                <Text style={styles.inputLabel}>MOT DE PASSE DE SÉCURITÉ</Text>
                <View style={styles.inputUnderline}>
                  <TextInput
                    style={styles.input}
                    placeholder="Votre signature numérique"
                    placeholderTextColor="#BCBCBC"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.showText}>
                      {showPassword ? "MASQUER" : "VOIR"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </MotiView>
            )}

            <View style={{ flex: 1, minHeight: 60 }} />

            {/* ACTIONS SANS BOUTON ROUGE */}
            <View
              style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}
            >
              {/* ACTION PRINCIPALE : RESTER (L'Élégance du Noir) */}
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.back();
                }}
                style={styles.primaryBtn}
                activeOpacity={0.9}
              >
                <Text style={styles.primaryBtnText}>Conserver mon compte</Text>
              </TouchableOpacity>

              {/* ACTION SECONDAIRE : SUPPRIMER (Lien discret / Ghost) */}
              <TouchableOpacity
                onPress={handleDelete}
                style={styles.ghostBtn}
                disabled={loading || (hasPassword && !password)}
              >
                {loading ? (
                  <ActivityIndicator color={THEME.textSecondary} size="small" />
                ) : (
                  <Text style={styles.ghostBtnText}>
                    Je confirme la clôture définitive
                  </Text>
                )}
              </TouchableOpacity>

              <Text style={styles.disclaimer}>
                En confirmant, vous acceptez les conditions de résiliation.
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
  header: {
    paddingHorizontal: 25,
  },
  closeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.border,
  },
  scrollContent: {
    paddingHorizontal: 32,
    flexGrow: 1,
  },

  /* HERO SECTION */
  heroSection: {
    marginTop: 40,
    marginBottom: 40,
  },
  heroTitle: {
    fontSize: 48,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    lineHeight: 52,
    letterSpacing: -1,
  },
  titleDivider: {
    width: 40,
    height: 2,
    backgroundColor: THEME.accent,
    marginVertical: 24,
  },
  heroSubtitle: {
    fontSize: 15,
    color: THEME.textSecondary,
    lineHeight: 24,
    letterSpacing: 0.2,
  },

  /* INFO SECTION */
  infoSection: {
    gap: 24,
    marginBottom: 40,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  infoNumber: {
    fontSize: 10,
    fontWeight: "700",
    color: THEME.accent,
    marginTop: 4,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.textMain,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: THEME.textSecondary,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },

  /* FORM SECTION */
  formSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 2,
    marginBottom: 15,
  },
  inputUnderline: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: THEME.textMain,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  showText: {
    fontSize: 10,
    fontWeight: "700",
    color: THEME.textMain,
    letterSpacing: 1,
  },

  /* FOOTER & BUTTONS */
  footer: {
    marginTop: "auto",
    alignItems: "center",
    gap: 20,
  },
  primaryBtn: {
    backgroundColor: THEME.textMain,
    width: "100%",
    height: 60,
    borderRadius: 0, // Look plus éditorial / carré
    justifyContent: "center",
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  ghostBtn: {
    paddingVertical: 10,
  },
  ghostBtnText: {
    color: THEME.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
    opacity: 0.8,
  },
  disclaimer: {
    fontSize: 11,
    color: "#BCBCBC",
    textAlign: "center",
    marginTop: 10,
  },
});
