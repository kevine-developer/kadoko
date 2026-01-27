import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authClient } from "@/features/auth";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { email, type } = useLocalSearchParams<{
    email: string;
    type: string;
  }>();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const handleOtpChange = (value: string, index: number) => {
    const char = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);

    if (char) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      showErrorToast("Code incomplet");
      return;
    }

    setLoading(true);
    Keyboard.dismiss();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const { error } = await authClient.emailOtp.verifyEmail({
        email: email!,
        otp: otpCode,
      });

      if (error) {
        showErrorToast(error.message || "Code invalide");
      } else {
        showSuccessToast(
          type === "change-email" ? "Identité confirmée" : "Compte vérifié",
        );
        if (type === "change-email") {
          router.dismiss(2);
        } else {
          router.replace("/(tabs)");
        }
      }
    } catch {
      showErrorToast("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setResendTimer(30);
    setCanResend(false);

    try {
      await authClient.emailOtp.sendVerificationOtp({
        email: email!,
        type:
          type === "verify" || type === "change-email"
            ? "email-verification"
            : "sign-in",
      });
      showSuccessToast("Nouveau code transmis");
    } catch {
      showErrorToast("Erreur lors de l'envoi");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />

      <View style={[styles.navBar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ThemedIcon name="chevron-back" size={24} colorName="textMain" />
        </TouchableOpacity>
        <ThemedText type="label" style={styles.navTitle}>
          SÉCURITÉ
        </ThemedText>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 700 }}
            style={styles.heroSection}
          >
            <ThemedText type="hero" style={styles.heroTitle}>
              Signature{"\n"}numérique.
            </ThemedText>
            <View
              style={[styles.titleDivider, { backgroundColor: theme.accent }]}
            />
            <ThemedText
              type="subtitle"
              colorName="textSecondary"
              style={styles.heroSubtitle}
            >
              Saisissez le code de sécurité transmis à l&apos;adresse{"\n"}
              <ThemedText type="defaultBold" style={{ color: theme.textMain }}>
                {email}
              </ThemedText>
            </ThemedText>
          </MotiView>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  {
                    color: digit ? theme.accent : theme.textMain,
                    borderBottomColor: digit ? theme.accent : theme.border,
                  },
                ]}
                value={digit}
                onChangeText={(val) => handleOtpChange(val, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                selectionColor={theme.accent}
              />
            ))}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                { backgroundColor: theme.textMain },
                otp.join("").length < 6 && styles.primaryBtnDisabled,
              ]}
              onPress={handleVerify}
              disabled={loading || otp.join("").length < 6}
            >
              {loading ? (
                <ActivityIndicator color={theme.background} size="small" />
              ) : (
                <ThemedText type="label" style={{ color: theme.background }}>
                  VÉRIFIER LE CODE
                </ThemedText>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendBtn}
              onPress={handleResend}
              disabled={!canResend}
            >
              <ThemedText
                type="label"
                colorName={canResend ? "accent" : "textSecondary"}
                style={[
                  styles.resendText,
                  !canResend && styles.resendTextDisabled,
                ]}
              >
                {canResend
                  ? "Renvoyer une nouvelle signature"
                  : `Nouvel envoi possible dans ${resendTimer}s`}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    marginTop: 10,
  },
  scrollContent: {
    paddingHorizontal: 32,
    flexGrow: 1,
  },
  heroSection: {
    marginTop: 30,
    marginBottom: 50,
  },
  heroTitle: {
    lineHeight: 44,
  },
  titleDivider: {
    width: 35,
    height: 2,
    marginVertical: 25,
  },
  heroSubtitle: {
    lineHeight: 22,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 60,
  },
  otpInput: {
    width: 40,
    height: 54,
    borderBottomWidth: 1,
    fontSize: 28,
    textAlign: "center",
  },
  footer: {
    marginTop: "auto",
    paddingBottom: 40,
  },
  primaryBtn: {
    height: 60,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  resendBtn: {
    marginTop: 25,
    alignItems: "center",
  },
  resendText: {
    textDecorationLine: "underline",
  },
  resendTextDisabled: {
    textDecorationLine: "none",
    opacity: 0.6,
  },
});
