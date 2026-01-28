import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import {
  authService,
  HeaderAuth,
  LayoutAuth,
  FormError,
} from "@/features/auth";
import { showSuccessToast } from "@/lib/toast";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Timer State pour le renvoi
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const handleResendLink = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setServerError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const response = await authService.resendVerificationEmail(email);
      if (response.success) {
        showSuccessToast("Nouveau lien envoyé");
        setResendTimer(120); // Plus long après un renvoi
        setCanResend(false);
      } else {
        setServerError(response.message);
      }
    } catch {
      setServerError("Erreur de communication");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LayoutAuth>
      <View style={[styles.navBar]}>
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedIcon name="chevron-back" size={24} colorName="textMain" />
        </TouchableOpacity>
        <ThemedText type="label" style={styles.navTitle}>
          VERIFICATION D&apos;EMAIL
        </ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <HeaderAuth title="Presque là." subtitle="VERIFICATION" />

          <FormError message={serverError} />

          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 500 }}
          >
            <ThemedText type="subtitle" style={styles.description}>
              Un lien de confirmation sécurisé a été envoyé à l&apos;adresse :
              {"\n"}
              <ThemedText type="default" bold style={styles.emailHighlight}>
                {email}
              </ThemedText>
            </ThemedText>

            <View style={styles.infoBox}>
              <ThemedIcon name="mail-outline" size={40} colorName="accent" />
              <ThemedText type="caption" style={styles.infoText}>
                Veuillez cliquer sur le lien contenu dans l&apos;email pour
                activer votre compte. Une fois validé, vous pourrez vous
                connecter.
              </ThemedText>
            </View>
            <TouchableOpacity
              style={styles.resendBtn}
              onPress={handleResendLink}
              disabled={!canResend || isLoading}
            >
              <ThemedText
                type="label"
                colorName="accent"
                style={[
                  styles.resendText,
                  !canResend && { opacity: 0.5 },
                  { textDecorationLine: "underline" },
                ]}
              >
                {canResend
                  ? "RENVOYER LE LIEN"
                  : `RENVOI POSSIBLE DANS ${resendTimer}S`}
              </ThemedText>
            </TouchableOpacity>

            {isLoading && (
              <ActivityIndicator
                style={{ marginTop: 20 }}
                color={theme.accent}
              />
            )}
          </MotiView>

          <TouchableOpacity
            style={[styles.backToLogin, { borderTopColor: theme.border }]}
            onPress={() => router.replace("/sign-in")}
          >
            <ThemedText
              type="label"
              colorName="textSecondary"
              style={styles.backToLoginText}
            >
              RETOUR À LA CONNEXION
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LayoutAuth>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  navTitle: {
    fontSize: 9,
    letterSpacing: 1.5,
  },
  scrollContent: {
    flexGrow: 1,
  },
  description: {
    marginBottom: 35,
    textAlign: "center",
    lineHeight: 22,
  },
  emailHighlight: {
    fontStyle: "normal",
  },
  infoBox: {
    alignItems: "center",
    padding: 25,
    backgroundColor: "rgba(175, 144, 98, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(175, 144, 98, 0.1)",
    marginBottom: 40,
    gap: 15,
  },
  infoText: {
    textAlign: "center",
    lineHeight: 18,
    opacity: 0.8,
  },
  resendBtn: {
    marginTop: 25,
    alignItems: "center",
  },
  resendText: {
    fontSize: 10,
    letterSpacing: 1,
  },
  backToLogin: {
    alignItems: "center",
    paddingVertical: 15,
    borderTopWidth: 1,
    marginVertical: 40,
  },
  backToLoginText: {
    fontSize: 10,
    letterSpacing: 1.5,
  },
});
