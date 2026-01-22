import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authClient } from "@/features/auth";
import { userService } from "@/lib/services/user-service";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { MotiView, AnimatePresence } from "moti";

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

  // Calcul du délai restant
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

  // Regex de validation (identique au backend)
  const USERNAME_REGEX =
    /^[a-zA-Z0-9](?!.*[_.]{2})[a-zA-Z0-9._]{1,28}[a-zA-Z0-9]$/;
  const [formatError, setFormatError] = useState<string | null>(null);

  // Debounce pour la vérification de disponibilité
  useEffect(() => {
    setFormatError(null);

    if (!username || username === user?.username) {
      setIsAvailable(null);
      setSuggestions([]);
      return;
    }

    if (username.length < 3) {
      setIsAvailable(null);
      setSuggestions([]);
      return;
    }

    // Validation locale du format
    if (!USERNAME_REGEX.test(username)) {
      setIsAvailable(null);
      setSuggestions([]);

      if (!/^[a-zA-Z0-9]/.test(username)) {
        setFormatError("Doit commencer par une lettre ou un chiffre");
      } else if (!/[a-zA-Z0-9]$/.test(username)) {
        setFormatError("Doit se terminer par une lettre ou un chiffre");
      } else if (/[_.]{2}/.test(username)) {
        setFormatError("Les points et tirets bas ne peuvent pas se suivre");
      } else {
        setFormatError("Format invalide (lettres, chiffres, . and _)");
      }
      return;
    }

    const timer = setTimeout(async () => {
      setIsChecking(true);
      const res = await userService.checkUsernameAvailability(username);
      setIsAvailable(res.available);

      if (!res.available) {
        const suggRes = await userService.getUsernameSuggestions(username);
        setSuggestions(suggRes.suggestions);
      } else {
        setSuggestions([]);
      }
      setIsChecking(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [username, user?.username]);

  const handleSave = async () => {
    if (!canChange || !isAvailable || isSaving) return;

    setIsSaving(true);

    try {
      const res = await userService.updateProfile({ username });
      if (res.success) {
        showSuccessToast("Nom d'utilisateur mis à jour !");
        await refetch();
        router.back();
      } else {
        showErrorToast(res.message);
      }
    } catch {
      showErrorToast("Une erreur est survenue");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nom d&apos;utilisateur</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Votre identité unique</Text>
            <Text style={styles.subtitle}>
              Le nom d&apos;utilisateur permet de partager votre profil et
              d&apos;être retrouvé par vos amis.
            </Text>

            {!canChange && (
              <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={styles.lockCard}
              >
                <Ionicons name="lock-closed" size={24} color="#B45309" />
                <View style={styles.lockTextContent}>
                  <Text style={styles.lockTitle}>Modification verrouillée</Text>
                  <Text style={styles.lockSubtitle}>
                    Vous pourrez modifier votre pseudo dans {remainingDays}{" "}
                    jours.
                  </Text>
                </View>
              </MotiView>
            )}

            <View style={styles.inputSection}>
              <View
                style={[
                  styles.inputWrapper,
                  !canChange && styles.inputWrapperDisabled,
                  isAvailable === true && styles.inputWrapperAvailable,
                  (isAvailable === false || formatError) &&
                    styles.inputWrapperUnavailable,
                ]}
              >
                <Text style={styles.prefix}>@</Text>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="pseudo"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={canChange && !isSaving}
                />
                {isChecking ? (
                  <ActivityIndicator size="small" color="#6B7280" />
                ) : (
                  <AnimatePresence>
                    {isAvailable === true && (
                      <MotiView
                        from={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#10B981"
                        />
                      </MotiView>
                    )}
                    {isAvailable === false && (
                      <MotiView
                        from={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                      >
                        <Ionicons
                          name="close-circle"
                          size={20}
                          color="#EF4444"
                        />
                      </MotiView>
                    )}
                  </AnimatePresence>
                )}
              </View>

              {isAvailable === true && (
                <Text style={styles.availableText}>
                  Ce nom d&apos;utilisateur est disponible !
                </Text>
              )}

              {formatError && (
                <Text style={styles.unavailableText}>{formatError}</Text>
              )}

              <AnimatePresence>
                {isAvailable === false && suggestions.length > 0 && (
                  <MotiView
                    from={{ opacity: 0, translateY: -10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    exit={{ opacity: 0, translateY: -10 }}
                    style={styles.suggestionsContainer}
                  >
                    <Text style={styles.unavailableText}>
                      Ce nom d&apos;utilisateur est déjà pris.
                    </Text>
                    <Text style={styles.suggestionTitle}>Suggestions :</Text>
                    <View style={styles.suggestionsList}>
                      {suggestions.map((s) => (
                        <TouchableOpacity
                          key={s}
                          style={styles.suggestionBadge}
                          onPress={() => setUsername(s)}
                        >
                          <Text style={styles.suggestionText}>@{s}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </MotiView>
                )}
              </AnimatePresence>
            </View>

            <View style={styles.footer}>
              <Text style={styles.infoText}>
                <Ionicons name="information-circle-outline" size={14} /> Une
                fois défini, vous ne pourrez plus le changer pendant 30 jours.
              </Text>

              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  (!canChange || !isAvailable || isSaving || !!formatError) &&
                    styles.saveBtnDisabled,
                ]}
                onPress={handleSave}
                disabled={
                  !canChange || !isAvailable || isSaving || !!formatError
                }
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Valider mon pseudo</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 24,
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: "#111827",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
    marginBottom: 32,
  },
  lockCard: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#FFFBEB",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
    marginBottom: 32,
    alignItems: "center",
  },
  lockTextContent: {
    marginLeft: 12,
    flex: 1,
  },
  lockTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 2,
  },
  lockSubtitle: {
    fontSize: 13,
    color: "#B45309",
  },
  inputSection: {
    marginBottom: 40,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 20,
    height: 64,
  },
  inputWrapperDisabled: {
    opacity: 0.6,
    backgroundColor: "#F3F4F6",
  },
  inputWrapperAvailable: {
    borderColor: "#10B981",
    backgroundColor: "#F0FDF4",
  },
  inputWrapperUnavailable: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  prefix: {
    fontSize: 20,
    fontWeight: "600",
    color: "#6B7280",
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    paddingVertical: 0, // important for center alignment on android
  },
  availableText: {
    color: "#059669",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
    marginLeft: 4,
  },
  unavailableText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
    marginLeft: 4,
  },
  suggestionsContainer: {
    marginTop: 16,
  },
  suggestionTitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  suggestionsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestionBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  footer: {
    marginTop: "auto",
    gap: 20,
  },
  infoText: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
  },
  saveBtn: {
    backgroundColor: "#111827",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  saveBtnDisabled: {
    backgroundColor: "#E5E7EB",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
