import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";
import { authClient } from "@/features/auth";
import { userService } from "@/lib/services/user-service";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import BtnValidate from "@/components/Settings/BtnValidate";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import SettingsNavBar from "@/components/Settings/SettingsNavBar";
import ThemedIcon from "@/components/themed-icon";

export default function NameSetupScreen() {
  const router = useRouter();
  const theme = useAppTheme();
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
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <SettingsNavBar title="NOM COMPLET" />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.content}>
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
                style={[styles.titleDivider, { backgroundColor: theme.accent }]}
              />
              <ThemedText type="hero" style={styles.heroTitle}>
                Comment vous{"\n"}appelle-t-on ?
              </ThemedText>
              <ThemedText
                type="subtitle"
                colorName="textSecondary"
                style={styles.heroSubtitle}
              >
                Votre nom sera l&apos;élément central de votre profil pour vos
                listes et vos cercles d&apos;amis.
              </ThemedText>
            </MotiView>

            <View style={styles.inputSection}>
              <ThemedText
                type="label"
                colorName="textSecondary"
                style={styles.miniLabel}
              >
                NOM OU PSEUDONYME
              </ThemedText>
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 300 }}
                style={[
                  styles.inputUnderline,
                  { borderBottomColor: theme.border },
                  hasChanges && { borderBottomColor: theme.accent },
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
                  value={name}
                  onChangeText={setName}
                  placeholder="Ex: Alexandre Dumas"
                  placeholderTextColor="#BCBCBC"
                  autoFocus
                  maxLength={50}
                  autoCapitalize="words"
                  selectionColor={theme.accent}
                />

                {name.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setName("");
                    }}
                    style={styles.clearBtn}
                  >
                    <ThemedIcon
                      name="close-circle"
                      size={18}
                      colorName="border"
                    />
                  </TouchableOpacity>
                )}
              </MotiView>
            </View>
          </View>

          <BtnValidate
            hasChanges={hasChanges}
            isSaving={isSaving}
            handleSave={handleSave}
            text="CONFIRMER L'IDENTITÉ"
          />
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 32, paddingTop: 30 },
  heroSection: { marginBottom: 50 },
  titleDivider: { height: 2, marginBottom: 25 },
  heroTitle: {},
  heroSubtitle: { marginTop: 20 },
  inputSection: { marginTop: 10 },
  miniLabel: { letterSpacing: 1.5, marginBottom: 12 },
  inputUnderline: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  input: { flex: 1, fontSize: 26, paddingVertical: 0 },
  clearBtn: { paddingLeft: 10 },
});
