import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";

// Hooks & Components
import { userService } from "@/lib/services/user-service";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { authClient } from "@/features/auth";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import BtnValidate from "@/components/Settings/BtnValidate";
import SettingsNavBar from "@/components/Settings/SettingsNavBar";

const MAX_CHARS = 160;

export default function BioSetupScreen() {
  const router = useRouter();
  const theme = useAppTheme();

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
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* NAV BAR MINIMALISTE */}
        <SettingsNavBar title="Biographie" />

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
              <ThemedText type="hero" colorName="textMain">
                Votre{"\n"}Essence.
              </ThemedText>
              <View
                style={[styles.titleDivider, { backgroundColor: theme.accent }]}
              />
              <ThemedText type="subtitle" colorName="textSecondary">
                Décrivez en quelques mots ce qui vous anime. Cela aidera vos
                proches à mieux vous comprendre.
              </ThemedText>
            </MotiView>

            {/* ZONE DE SAISIE ÉPURÉE */}
            <View style={styles.inputSection}>
              <View style={styles.labelRow}>
                <ThemedText type="label" colorName="textSecondary">
                  SIGNATURE PERSONNELLE
                </ThemedText>
                <ThemedText
                  type="caption"
                  style={{
                    color: charsLeft < 10 ? theme.danger : theme.textSecondary,
                  }}
                >
                  {charsLeft}
                </ThemedText>
              </View>

              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.textMain,
                    borderBottomColor: theme.border,
                    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
                  },
                ]}
                value={bio}
                onChangeText={setBio}
                placeholder="Ex: Amoureux de café, de design et de randonnées..."
                placeholderTextColor={theme.textSecondary}
                multiline
                maxLength={MAX_CHARS}
                autoFocus
                textAlignVertical="top"
                selectionColor={theme.accent}
              />
            </View>
          </ScrollView>

          {/* FOOTER ACTION - BOUTON RECTANGULAIRE */}
          <BtnValidate
            hasChanges={hasChanges}
            isSaving={isSaving}
            handleSave={handleSave}
          />
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 32,
    paddingTop: 30,
  },
  heroSection: {
    marginBottom: 40,
  },
  titleDivider: {
    width: 35,
    height: 2,
    marginVertical: 25,
  },
  inputSection: {
    marginTop: 10,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  input: {
    fontSize: 18,
    lineHeight: 28,
    minHeight: 150,
    textAlignVertical: "top",
    borderBottomWidth: 1,
    paddingBottom: 20,
  },
});
