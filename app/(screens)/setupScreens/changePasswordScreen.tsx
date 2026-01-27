import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { authClient } from "@/features/auth";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import SettingsNavBar from "@/components/Settings/SettingsNavBar";
import BtnValidate from "@/components/Settings/BtnValidate";
import SettingHero from "@/components/Settings/SettingHero";

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
  const theme = useAppTheme();

  return (
    <View style={styles.inputGroup}>
      <ThemedText
        type="label"
        colorName="textSecondary"
        style={styles.miniLabel}
      >
        {label}
      </ThemedText>
      <View
        style={[
          styles.inputUnderline,
          { borderBottomColor: theme.border },
          error && { borderBottomColor: theme.danger },
        ]}
      >
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            {
              color: theme.textMain,
              fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor="#BCBCBC"
          secureTextEntry={!isVisible}
          value={value}
          onChangeText={onChangeText}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          autoCapitalize="none"
          selectionColor={theme.accent}
        />
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsVisible(!isVisible);
          }}
          style={styles.eyeBtn}
        >
          <ThemedText type="label" style={styles.eyeBtnText}>
            {isVisible ? "MASQUER" : "VOIR"}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function ChangePasswordScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const [isSaving, setIsSaving] = useState(false);

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

    setIsSaving(true);
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
      setIsSaving(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <SettingsNavBar title="SÉCURITÉ" />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <SettingHero
              title={`Nouveau\nmot de passe`}
              subtitle="Protégez l'acces à vos listes et vos données personnelles avec une signature secrète forte."
            />

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

              <View style={styles.validationRow}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: theme.border },
                    isLengthValid && { backgroundColor: theme.accent },
                  ]}
                />
                <ThemedText
                  type="caption"
                  colorName={isLengthValid ? "accent" : "textSecondary"}
                >
                  Exigence de sécurité : 8 caractères minimum
                </ThemedText>
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

              {confirmPassword.length > 0 && (
                <View style={styles.validationRow}>
                  <ThemedText
                    type="caption"
                    style={{ color: isMatch ? theme.success : theme.danger }}
                  >
                    {isMatch
                      ? "Les signatures correspondent"
                      : "Les signatures diffèrent"}
                  </ThemedText>
                </View>
              )}
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>

          <View style={styles.footerContainer}>
            <BtnValidate
              hasChanges={canSubmit}
              isSaving={isSaving}
              handleSave={handleUpdatePassword}
              text="METTRE À JOUR LA SÉCURITÉ"
            />
            <ThemedText
              type="caption"
              colorName="textSecondary"
              style={styles.helperFooter}
            >
              Cela déconnectera vos autres sessions actives.
            </ThemedText>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 32, flexGrow: 1 },

  formContainer: { marginBottom: 20 },
  inputGroup: { marginBottom: 10 },
  miniLabel: { letterSpacing: 1.5, marginBottom: 12 },
  inputUnderline: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  input: { flex: 1, fontSize: 18 },
  eyeBtn: { paddingLeft: 10 },
  eyeBtnText: { letterSpacing: 1 },
  validationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },
  dot: { width: 4, height: 4, borderRadius: 2 },
  footerContainer: { paddingTop: 10 },
  helperFooter: {
    marginTop: 10,
    textAlign: "center",
    letterSpacing: 0.5,
    marginBottom: 20,
  },
});
