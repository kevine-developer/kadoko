import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
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

// --- THEME ÉDITORIAL COHÉRENT ---
const THEME = {
  background: "#FDFBF7", // Bone Silk
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  primary: "#1A1A1A",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.08)",
};

export default function VerifyEmailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    // Nettoyage si copier-coller
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
    <View style={styles.container}>
      {/* NAV BAR MINIMALISTE */}
      <View style={[styles.navBar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
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
          keyboardShouldPersistTaps="handled"
        >
          {/* HERO SECTION */}
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 700 }}
            style={styles.heroSection}
          >
            <Text style={styles.heroTitle}>Signature{"\n"}numérique.</Text>
            <View style={styles.titleDivider} />
            <Text style={styles.heroSubtitle}>
              Saisissez le code de sécurité transmis à l&apos;adresse{"\n"}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>
          </MotiView>

          {/* OTP INPUTS - STYLE REGISTRE */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  digit ? styles.otpInputFilled : null,
                  { borderBottomColor: digit ? THEME.accent : THEME.border },
                ]}
                value={digit}
                onChangeText={(val) => handleOtpChange(val, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                selectionColor={THEME.accent}
              />
            ))}
          </View>

          {/* ACTION BUTTON - RECTANGULAIRE LUXE */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                otp.join("").length < 6 && styles.primaryBtnDisabled,
              ]}
              onPress={handleVerify}
              disabled={loading || otp.join("").length < 6}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>VÉRIFIER LE CODE</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendBtn}
              onPress={handleResend}
              disabled={!canResend}
            >
              <Text
                style={[
                  styles.resendText,
                  !canResend && styles.resendTextDisabled,
                ]}
              >
                {canResend
                  ? "Renvoyer une nouvelle signature"
                  : `Nouvel envoi possible dans ${resendTimer}s`}
              </Text>
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
  /* HERO SECTION */
  heroSection: {
    marginTop: 30,
    marginBottom: 50,
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
  emailHighlight: {
    color: THEME.textMain,
    fontWeight: "700",
    fontStyle: "normal",
  },
  /* OTP INPUTS */
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
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    textAlign: "center",
  },
  otpInputFilled: {
    color: THEME.accent,
  },
  /* FOOTER & BUTTONS */
  footer: {
    marginTop: "auto",
    paddingBottom: 40,
  },
  primaryBtn: {
    backgroundColor: THEME.primary,
    height: 60,
    borderRadius: 0, // Rectangulaire luxe
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  resendBtn: {
    marginTop: 25,
    alignItems: "center",
  },
  resendText: {
    fontSize: 11,
    fontWeight: "700",
    color: THEME.accent,
    letterSpacing: 0.5,
    textDecorationLine: "underline",
  },
  resendTextDisabled: {
    color: THEME.textSecondary,
    textDecorationLine: "none",
    opacity: 0.6,
  },
});
