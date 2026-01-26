import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
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
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { authClient } from "@/features/auth";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

// --- THEME ÉDITORIAL ---
const THEME = {
  background: "#FDFBF7",
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  primary: "#1A1A1A",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.08)",
  success: "#4A6741",
  error: "#C34A4A",
};

// --- COMPOSANT INPUT ÉDITORIAL ---
const EditorialPasswordInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  returnKeyType = "next",
  onSubmitEditing,
  inputRef,
  error = false,
}: any) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.miniLabel}>{label}</Text>
      <View
        style={[
          styles.inputUnderline,
          error && { borderBottomColor: THEME.error },
        ]}
      >
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#BCBCBC"
          secureTextEntry={!isVisible}
          value={value}
          onChangeText={onChangeText}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          autoCapitalize="none"
          selectionColor={THEME.accent}
        />
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsVisible(!isVisible);
          }}
          style={styles.eyeBtn}
        >
          <Text style={styles.eyeBtnText}>
            {isVisible ? "MASQUER" : "VOIR"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function ChangePasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const newPassRef = useRef<TextInput>(null);
  const confirmPassRef = useRef<TextInput>(null);

  const isLengthValid = newPassword.length >= 8;
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const canSubmit = currentPassword.length > 0 && isLengthValid && isMatch;

  const handleUpdatePassword = async () => {
    if (!canSubmit) return;

    setLoading(true);
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { error } = await authClient.changePassword({
        newPassword,
        currentPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        showErrorToast(error.message || "Mot de passe actuel incorrect");
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showSuccessToast("Sécurité mise à jour");
        router.back();
      }
    } catch {
      showErrorToast("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* NAV BAR */}
        <View style={[styles.navBar, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={24} color={THEME.textMain} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>SÉCURITÉ</Text>
          <View style={{ width: 44 }} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
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
              <Text style={styles.heroTitle}>Nouveau{"\n"}mot de passe.</Text>
              <View style={styles.titleDivider} />
              <Text style={styles.heroSubtitle}>
                Protégez l&apos;accès à vos listes et vos données personnelles avec
                une signature secrète forte.
              </Text>
            </MotiView>

            {/* FORMULAIRE */}
            <View style={styles.formContainer}>
              <EditorialPasswordInput
                label="SIGNATURE ACTUELLE"
                placeholder="Votre mot de passe actuel"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                onSubmitEditing={() => newPassRef.current?.focus()}
              />

              <View style={{ height: 20 }} />

              <EditorialPasswordInput
                inputRef={newPassRef}
                label="NOUVELLE SIGNATURE"
                placeholder="8 caractères minimum"
                value={newPassword}
                onChangeText={setNewPassword}
                onSubmitEditing={() => confirmPassRef.current?.focus()}
                error={newPassword.length > 0 && !isLengthValid}
              />

              {/* Validation Nouveau MDP */}
              <View style={styles.validationRow}>
                <View style={[styles.dot, isLengthValid && styles.dotActive]} />
                <Text
                  style={[
                    styles.validationText,
                    isLengthValid && styles.textActive,
                  ]}
                >
                  Exigence de sécurité : 8 caractères minimum
                </Text>
              </View>

              <View style={{ height: 30 }} />

              <EditorialPasswordInput
                inputRef={confirmPassRef}
                label="CONFIRMATION"
                placeholder="Répétez la signature"
                returnKeyType="done"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onSubmitEditing={handleUpdatePassword}
                error={confirmPassword.length > 0 && !isMatch}
              />

              {/* Validation Match */}
              {confirmPassword.length > 0 && (
                <View style={styles.validationRow}>
                  <Ionicons
                    name={isMatch ? "checkmark" : "close"}
                    size={12}
                    color={isMatch ? THEME.success : THEME.error}
                  />
                  <Text
                    style={[
                      styles.validationText,
                      { color: isMatch ? THEME.success : THEME.error },
                    ]}
                  >
                    {isMatch
                      ? "Les signatures correspondent"
                      : "Les signatures diffèrent"}
                  </Text>
                </View>
              )}
            </View>

            {/* FOOTER ACTION */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  (!canSubmit || loading) && styles.primaryBtnDisabled,
                ]}
                onPress={handleUpdatePassword}
                disabled={!canSubmit || loading}
                activeOpacity={0.9}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.primaryBtnText}>
                    Mettre à jour la sécurité
                  </Text>
                )}
              </TouchableOpacity>
              <Text style={styles.helperFooter}>
                Cela déconnectera vos autres sessions actives.
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
  scrollContent: {
    paddingHorizontal: 32,
    flexGrow: 1,
  },
  /* HERO */
  heroSection: {
    marginTop: 30,
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
  /* FORM CONTAINER */
  formContainer: {
    marginBottom: 20,
  },
  /* INPUT COMPONENT */
  inputGroup: {
    marginBottom: 10,
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
    fontSize: 18,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
  },
  eyeBtn: {
    paddingLeft: 10,
  },
  eyeBtnText: {
    fontSize: 9,
    fontWeight: "800",
    color: THEME.textMain,
    letterSpacing: 1,
  },
  /* VALIDATION */
  validationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.border,
  },
  dotActive: {
    backgroundColor: THEME.accent,
  },
  validationText: {
    fontSize: 11,
    color: THEME.textSecondary,
    fontWeight: "500",
  },
  textActive: {
    color: THEME.accent,
  },
  /* FOOTER */
  footer: {
    marginTop: "auto",
    paddingBottom: 30,
    paddingTop: 20,
  },
  primaryBtn: {
    backgroundColor: THEME.primary,
    height: 60,
    borderRadius: 0,
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
  helperFooter: {
    marginTop: 15,
    fontSize: 11,
    color: THEME.textSecondary,
    textAlign: "center",
    letterSpacing: 0.5,
  },
});
