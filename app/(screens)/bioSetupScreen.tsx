import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";

import { userService } from "@/lib/services/user-service";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { authClient } from "@/features/auth";

// --- THEME ÉDITORIAL COHÉRENT ---
const THEME = {
  background: "#FDFBF7", // Bone Silk
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  primary: "#1A1A1A",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.08)",
  danger: "#C34A4A",
};

const MAX_CHARS = 160;

export default function BioSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: session, refetch } = authClient.useSession();
  const user = session?.user as any;

  const [bio, setBio] = useState(user?.description || "");
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges = bio.trim() !== (user?.description || "");
  const charsLeft = MAX_CHARS - bio.length;

  const handleSave = async () => {
    if (!hasChanges || isSaving) return;

    setIsSaving(true);
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const res = await userService.updateProfile({ description: bio.trim() });
      if (res.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showSuccessToast("Profil mis à jour");
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
          <Text style={styles.navTitle}>BIOGRAPHIE</Text>
          <View style={{ width: 44 }} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* HERO SECTION */}
            <MotiView
              from={{ opacity: 0, translateY: 15 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 700 }}
              style={styles.heroSection}
            >
              <Text style={styles.heroTitle}>Votre{"\n"}Essence.</Text>
              <View style={styles.titleDivider} />
              <Text style={styles.heroSubtitle}>
                Décrivez en quelques mots ce qui vous anime. Cela aidera vos
                proches à mieux vous comprendre.
              </Text>
            </MotiView>

            {/* ZONE DE SAISIE ÉPURÉE */}
            <View style={styles.inputSection}>
              <View style={styles.labelRow}>
                <Text style={styles.miniLabel}>SIGNATURE PERSONNELLE</Text>
                <Text
                  style={[
                    styles.counter,
                    charsLeft < 10 && { color: THEME.danger },
                  ]}
                >
                  {charsLeft}
                </Text>
              </View>

              <TextInput
                style={styles.input}
                value={bio}
                onChangeText={setBio}
                placeholder="Ex: Amoureux de café, de design et de randonnées..."
                placeholderTextColor="#BCBCBC"
                multiline
                maxLength={MAX_CHARS}
                autoFocus
                textAlignVertical="top"
                selectionColor={THEME.accent}
              />
            </View>
          </ScrollView>

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
                <Text style={styles.primaryBtnText}>ENREGISTRER LE PROFIL</Text>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 32,
    paddingTop: 30,
  },

  /* HERO SECTION */
  heroSection: {
    marginBottom: 40,
  },
  heroTitle: {
    fontSize: 38,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    lineHeight: 44,
    letterSpacing: -1,
  },
  titleDivider: {
    width: 35,
    height: 2,
    backgroundColor: THEME.accent,
    marginVertical: 25,
  },
  heroSubtitle: {
    fontSize: 14,
    color: THEME.textSecondary,
    lineHeight: 22,
    fontStyle: "italic",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },

  /* INPUT SECTION */
  inputSection: {
    marginTop: 10,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  miniLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1.5,
  },
  counter: {
    fontSize: 10,
    fontWeight: "700",
    color: "#D1D5DB",
    fontVariant: ["tabular-nums"],
  },
  input: {
    fontSize: 18,
    color: THEME.textMain,
    lineHeight: 28,
    minHeight: 150,
    textAlignVertical: "top",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    paddingBottom: 20,
  },

  /* FOOTER & BUTTON */
  footer: {
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  primaryBtn: {
    backgroundColor: THEME.primary,
    height: 60,
    borderRadius: 0, // Rectangulaire luxe
    flexDirection: "row",
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
