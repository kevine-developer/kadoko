import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView, AnimatePresence } from "moti";
import * as Haptics from "expo-haptics";

// Hooks & Components
import { userService } from "@/lib/services/user-service";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { authClient } from "@/features/auth";
import { ThemedText } from "@/components/themed-text";
import Icon from "@/components/themed-icon";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import SettingsNavBar from "@/components/Settings/SettingsNavBar";
import BtnValidate from "@/components/Settings/BtnValidate";
import SettingHero from "@/components/Settings/SettingHero";

const USERNAME_REGEX =
  /^[a-zA-Z0-9](?!.*[_.]{2})[a-zA-Z0-9._]{1,28}[a-zA-Z0-9]$/;

export default function UsernameSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

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
      if (!/^[a-zA-Z0-9]/.test(username))
        setFormatError("Doit commencer par un caractère");
      else if (!/[a-zA-Z0-9]$/.test(username))
        setFormatError("Doit finir par un caractère");
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
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* NAV BAR */}
        <SettingsNavBar title="Identité" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.content}>
            {/* HERO SECTION */}
            <SettingHero
              title={`Votre alias\nunique.`}
              subtitle="C&apos;est ainsi que vos amis vous identifieront pour partager leurs intentions."
            />

            {/* INFO LOCK */}
            {!canChange && (
              <View
                style={[styles.lockBanner, { backgroundColor: theme.surface }]}
              >
                <Icon name="time-outline"  colorName="accent" />
                <ThemedText
                  type="defaultBold"
                  colorName="textSecondary"
                  style={{ fontSize: 12 }}
                >
                  Modification possible dans {remainingDays} jours
                </ThemedText>
              </View>
            )}

            {/* INPUT SECTION */}
            <View style={styles.inputSection}>
              <ThemedText type="label" colorName="textSecondary">
                SIGNATURE @
              </ThemedText>
              <View
                style={[
                  styles.inputUnderline,
                  { borderBottomColor: theme.border },
                  isAvailable === true && { borderBottomColor: theme.success },
                  (isAvailable === false || formatError) && {
                    borderBottomColor: theme.danger,
                  },
                ]}
              >
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.textMain,
                      fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
                    },
                  ]}
                  value={username}
                  onChangeText={(t) => setUsername(t.toLowerCase())}
                  placeholder="votre.nom"
                  placeholderTextColor={theme.textSecondary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={canChange && !isSaving}
                  selectionColor={theme.accent}
                />
                <View style={styles.statusIndicator}>
                  {isChecking ? (
                    <ActivityIndicator size="small" color={theme.accent} />
                  ) : isAvailable === true ? (
                    <Icon name="checkmark"  colorName="success" />
                  ) : isAvailable === false ? (
                    <Icon name="close"  colorName="danger" />
                  ) : null}
                </View>
              </View>

              <View style={styles.feedbackBox}>
                {formatError && (
                  <ThemedText type="caption" colorName="danger">
                    {formatError}
                  </ThemedText>
                )}
                {isAvailable === false && !formatError && (
                  <ThemedText type="caption" colorName="danger">
                    Cet alias est déjà utilisé
                  </ThemedText>
                )}
                {isAvailable === true && (
                  <ThemedText type="caption" style={{ color: theme.success }}>
                    Alias disponible
                  </ThemedText>
                )}
              </View>

              {/* SUGGESTIONS */}
              <AnimatePresence>
                {isAvailable === false && suggestions.length > 0 && (
                  <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={styles.suggestionsContainer}
                  >
                    <ThemedText
                      type="label"
                      colorName="textSecondary"
                      style={{ marginBottom: 15 }}
                    >
                      RECOMMANDATIONS
                    </ThemedText>
                    <View style={styles.chipsRow}>
                      {suggestions.map((s) => (
                        <TouchableOpacity
                          key={s}
                          style={[
                            styles.suggestionChip,
                            {
                              borderColor: theme.border,
                              backgroundColor: theme.surface,
                            },
                          ]}
                          onPress={() => {
                            Haptics.selectionAsync();
                            setUsername(s);
                          }}
                        >
                          <ThemedText
                            type="defaultBold"
                            style={{ fontSize: 12 }}
                          >
                            {s}
                          </ThemedText>
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
            <BtnValidate
              hasChanges={canChange}
              isSaving={isSaving}
              handleSave={handleSave}
              text="VALIDER L'IDENTITÉ"
              isAvailable={isAvailable}
            />
            <ThemedText
              type="caption"
              colorName="textSecondary"
              style={styles.disclaimer}
            >
              L&apos;alias peut être modifié une fois tous les 30 jours.
            </ThemedText>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  content: { flex: 1, paddingHorizontal: 32, paddingTop: 30 },
  lockBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#AF9062",
    marginBottom: 30,
    gap: 10,
  },
  inputSection: { marginBottom: 20 },
  inputUnderline: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  input: { flex: 1, fontSize: 24, fontWeight: "500" },
  statusIndicator: { marginLeft: 10 },
  feedbackBox: { marginTop: 10, minHeight: 20 },
  suggestionsContainer: { marginTop: 20 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  suggestionChip: { paddingHorizontal: 15, paddingVertical: 8, borderWidth: 1 },
  footer: { paddingHorizontal: 32 },
  primaryBtn: { height: 60, alignItems: "center", justifyContent: "center" },
  disclaimer: { textAlign: "center", marginTop: 15, fontStyle: "italic" },
});
