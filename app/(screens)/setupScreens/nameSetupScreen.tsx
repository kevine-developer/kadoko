import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";
import { authClient } from "@/features/auth";
import { userService } from "@/lib/services/user-service";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

// --- THEME ÉDITORIAL COHÉRENT ---
const THEME = {
  background: "#FDFBF7", // Bone Silk
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  primary: "#1A1A1A",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.08)",
};

export default function NameSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: session, refetch } = authClient.useSession();
  const user = session?.user;

  const [name, setName] = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges = name.trim() !== user?.name && name.trim().length >= 2;

  const handleSave = async () => {
    if (!hasChanges || isSaving) return;

    setIsSaving(true);
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const res = await userService.updateProfile({ name: name.trim() });
      if (res.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showSuccessToast("Identité mise à jour");
        await refetch();
        router.back();
      } else {
        showErrorToast(res.message || "Erreur de sauvegarde");
      }
    } catch {
      showErrorToast("Erreur serveur");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* NAV BAR MINIMALISTE */}
        <View style={[styles.navBar, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={24} color={THEME.textMain} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>NOM COMPLET</Text>
          <View style={{ width: 44 }} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.content}>
            {/* HERO SECTION */}
            <MotiView
              from={{ opacity: 0, translateY: 15 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 700 }}
              style={styles.heroSection}
            >
              <MotiView
                from={{ width: 0 }}
                animate={{ width: 35 }}
                transition={{ type: "timing", duration: 800, delay: 200 }}
                style={styles.titleDivider}
              />
              <Text style={styles.heroTitle}>Comment vous{"\n"}appelle-t-on ?</Text>
              <Text style={styles.heroSubtitle}>
                Votre nom sera l&apos;élément central de votre profil pour vos listes et vos cercles d&apos;amis.
              </Text>
            </MotiView>

            {/* INPUT "SIGNATURE" */}
            <View style={styles.inputSection}>
              <Text style={styles.miniLabel}>NOM OU PSEUDONYME</Text>
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 300 }}
                style={[
                  styles.inputUnderline,
                  hasChanges && { borderBottomColor: THEME.accent }
                ]}
              >
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Ex: Alexandre Dumas"
                  placeholderTextColor="#BCBCBC"
                  autoFocus
                  maxLength={50}
                  autoCapitalize="words"
                  selectionColor={THEME.accent}
                />
                
                {name.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setName("");
                    }}
                    style={styles.clearBtn}
                  >
                    <Ionicons name="close-circle" size={18} color="#D1D5DB" />
                  </TouchableOpacity>
                )}
              </MotiView>
            </View>
          </View>

          {/* FOOTER ACTION - BOUTON RECTANGULAIRE */}
          <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                (!hasChanges || isSaving) && styles.primaryBtnDisabled,
              ]}
              onPress={handleSave}
              disabled={!hasChanges || isSaving}
              activeOpacity={0.9}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>CONFIRMER L&apos;IDENTITÉ</Text>
              )}
            </TouchableOpacity>
          </View>
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
  /* NAV BAR */
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
  navTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.textMain,
    letterSpacing: 2,
  },
  /* CONTENT */
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 30,
  },
  heroSection: {
    marginBottom: 50,
  },
  titleDivider: {
    height: 2,
    backgroundColor: THEME.accent,
    marginBottom: 25,
  },
  heroTitle: {
    fontSize: 38,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    lineHeight: 44,
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 15,
    color: THEME.textSecondary,
    lineHeight: 24,
    marginTop: 20,
    fontStyle: "italic",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  /* INPUT AREA */
  inputSection: {
    marginTop: 10,
  },
  miniLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  inputUnderline: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    paddingBottom: 8,
  },
  input: {
    flex: 1,
    fontSize: 26,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    paddingVertical: 0,
  },
  clearBtn: {
    paddingLeft: 10,
  },
  /* FOOTER & BUTTON */
  footer: {
    paddingHorizontal: 32,
  },
  primaryBtn: {
    backgroundColor: THEME.primary,
    height: 60,
    borderRadius: 0, // Rectangulaire luxe
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnDisabled: {
    backgroundColor: "#E5E7EB",
    opacity: 0.6,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});