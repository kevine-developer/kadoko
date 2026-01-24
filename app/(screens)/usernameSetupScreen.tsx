import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
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
import { MotiView, AnimatePresence } from "moti";
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
  success: "#4A6741", // Vert forêt
  error: "#C34A4A",
  warningBg: "#F9F6F0",
};

const USERNAME_REGEX = /^[a-zA-Z0-9](?!.*[_.]{2})[a-zA-Z0-9._]{1,28}[a-zA-Z0-9]$/;

export default function UsernameSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: session, refetch } = authClient.useSession();
  const user = session?.user as any;

  const [username, setUsername] = useState(user?.username || "");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [formatError, setFormatError] = useState<string | null>(null);

  const getRemainingDays = () => {
    if (!user?.usernameUpdatedAt) return 0;
    const now = new Date();
    const lastUpdate = new Date(user.usernameUpdatedAt);
    const diffTime = now.getTime() - lastUpdate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
    return Math.max(0, 30 - diffDays);
  };

  const remainingDays = getRemainingDays();
  const canChange = remainingDays <= 0;

  useEffect(() => {
    setFormatError(null);
    if (!username || username === user?.username) {
      setIsAvailable(null);
      setSuggestions([]);
      return;
    }
    if (username.length < 3) {
      setIsAvailable(null);
      return;
    }

    if (!USERNAME_REGEX.test(username)) {
      setIsAvailable(false);
      setSuggestions([]);
      if (!/^[a-zA-Z0-9]/.test(username)) setFormatError("Doit commencer par un caractère");
      else if (!/[a-zA-Z0-9]$/.test(username)) setFormatError("Doit finir par un caractère");
      else setFormatError("Format invalide");
      return;
    }

    const timer = setTimeout(async () => {
      setIsChecking(true);
      try {
        const res = await userService.checkUsernameAvailability(username);
        setIsAvailable(res.available);
        if (!res.available) {
          const suggRes = await userService.getUsernameSuggestions(username);
          setSuggestions(suggRes.suggestions || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, user?.username]);

  const handleSave = async () => {
    if (!canChange || !isAvailable || isSaving) return;
    setIsSaving(true);
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const res = await userService.updateProfile({ username });
      if (res.success) {
        showSuccessToast("Alias mis à jour");
        await refetch();
        router.back();
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
        {/* NAV BAR */}
        <View style={[styles.navBar, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={THEME.textMain} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>IDENTITÉ</Text>
          <View style={{ width: 44 }} />
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View style={styles.content}>
            {/* HERO SECTION */}
            <MotiView
              from={{ opacity: 0, translateY: 15 }}
              animate={{ opacity: 1, translateY: 0 }}
              style={styles.heroSection}
            >
              <Text style={styles.heroTitle}>Votre alias{"\n"}unique.</Text>
              <View style={styles.titleDivider} />
              <Text style={styles.heroSubtitle}>
                C&apos;est ainsi que vos amis vous identifieront pour partager leurs intentions.
              </Text>
            </MotiView>

            {/* INFO LOCK */}
            {!canChange && (
              <View style={styles.lockBanner}>
                <Ionicons name="time-outline" size={16} color={THEME.accent} />
                <Text style={styles.lockText}>Modification possible dans {remainingDays} jours</Text>
              </View>
            )}

            {/* INPUT SECTION */}
            <View style={styles.inputSection}>
              <Text style={styles.miniLabel}>SIGNATURE @</Text>
              <View style={[styles.inputUnderline, isAvailable === true && { borderBottomColor: THEME.success }, (isAvailable === false || formatError) && { borderBottomColor: THEME.error }]}>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={(t) => setUsername(t.toLowerCase())}
                  placeholder="votre.nom"
                  placeholderTextColor="#BCBCBC"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={canChange && !isSaving}
                  selectionColor={THEME.accent}
                />
                <View style={styles.statusIndicator}>
                  {isChecking ? <ActivityIndicator size="small" color={THEME.accent} /> : 
                   isAvailable === true ? <Ionicons name="checkmark" size={20} color={THEME.success} /> :
                   isAvailable === false ? <Ionicons name="close" size={20} color={THEME.error} /> : null}
                </View>
              </View>

              <View style={styles.feedbackBox}>
                {formatError && <Text style={styles.errorText}>{formatError}</Text>}
                {isAvailable === false && !formatError && <Text style={styles.errorText}>Cet alias est déjà réservé</Text>}
                {isAvailable === true && <Text style={styles.successText}>Alias disponible</Text>}
              </View>

              {/* SUGGESTIONS ÉDITORIALES */}
              <AnimatePresence>
                {isAvailable === false && suggestions.length > 0 && (
                  <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.suggestionsContainer}>
                    <Text style={styles.miniLabel}>RECOMMANDATIONS</Text>
                    <View style={styles.chipsRow}>
                      {suggestions.map((s) => (
                        <TouchableOpacity key={s} style={styles.suggestionChip} onPress={() => { Haptics.selectionAsync(); setUsername(s); }}>
                          <Text style={styles.suggestionText}>{s}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </MotiView>
                )}
              </AnimatePresence>
            </View>
          </View>

          {/* FOOTER ACTION */}
          <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
            <TouchableOpacity
              style={[styles.primaryBtn, (!canChange || !isAvailable || isSaving) && styles.primaryBtnDisabled]}
              onPress={handleSave}
              disabled={!canChange || !isAvailable || isSaving}
            >
              {isSaving ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.primaryBtnText}>VALIDER L&apos;IDENTITÉ</Text>}
            </TouchableOpacity>
            <Text style={styles.disclaimer}>L&apos;alias peut être modifié une fois tous les 30 jours.</Text>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  navBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 15 },
  navTitle: { fontSize: 10, fontWeight: "800", color: THEME.textMain, letterSpacing: 2 },
  backBtn: { width: 44, height: 44, justifyContent: "center", alignItems: "center" },
  content: { flex: 1, paddingHorizontal: 32, paddingTop: 30 },

  /* HERO */
  heroSection: { marginBottom: 40 },
  heroTitle: { fontSize: 38, fontFamily: Platform.OS === "ios" ? "Georgia" : "serif", color: THEME.textMain, lineHeight: 44, letterSpacing: -1 },
  titleDivider: { width: 35, height: 2, backgroundColor: THEME.accent, marginVertical: 25 },
  heroSubtitle: { fontSize: 14, color: THEME.textSecondary, lineHeight: 22, fontStyle: "italic", fontFamily: Platform.OS === "ios" ? "Georgia" : "serif" },

  /* LOCK BANNER */
  lockBanner: { flexDirection: "row", alignItems: "center", backgroundColor: THEME.warningBg, padding: 12, borderLeftWidth: 2, borderLeftColor: THEME.accent, marginBottom: 30, gap: 10 },
  lockText: { fontSize: 12, color: THEME.textMain, fontWeight: "600", letterSpacing: 0.2 },

  /* INPUT */
  inputSection: { marginBottom: 20 },
  miniLabel: { fontSize: 9, fontWeight: "800", color: THEME.textSecondary, letterSpacing: 1.5, marginBottom: 15 },
  inputUnderline: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: THEME.border, paddingBottom: 10 },
  input: { flex: 1, fontSize: 24, fontWeight: "500", color: THEME.textMain, fontFamily: Platform.OS === "ios" ? "Georgia" : "serif" },
  statusIndicator: { marginLeft: 10 },
  
  feedbackBox: { marginTop: 10, minHeight: 20 },
  errorText: { color: THEME.error, fontSize: 11, fontWeight: "600" },
  successText: { color: THEME.success, fontSize: 11, fontWeight: "600" },

  /* SUGGESTIONS */
  suggestionsContainer: { marginTop: 20 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  suggestionChip: { paddingHorizontal: 15, paddingVertical: 8, borderWidth: 1, borderColor: THEME.border, backgroundColor: "#FFF" },
  suggestionText: { fontSize: 12, fontWeight: "700", color: THEME.textMain },

  /* FOOTER */
  footer: { paddingHorizontal: 32 },
  primaryBtn: { backgroundColor: THEME.primary, height: 60, alignItems: "center", justifyContent: "center" },
  primaryBtnDisabled: { backgroundColor: "#E5E7EB", opacity: 0.6 },
  primaryBtnText: { color: "#FFF", fontSize: 14, fontWeight: "700", letterSpacing: 1 },
  disclaimer: { textAlign: "center", fontSize: 11, color: THEME.textSecondary, marginTop: 15, fontStyle: "italic" },
});