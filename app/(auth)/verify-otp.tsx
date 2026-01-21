import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
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
// import { authClient } from "@/lib/auth/auth-client";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import HeaderAuth from "@/components/auth/headerAuth";
import LayoutAuth from "@/components/auth/LayoutAuth";

const THEME = {
  background: "#FDFBF7",
  textMain: "#111827",
  textSecondary: "#6B7280",
  primary: "#111827",
  border: "#E5E7EB",
  inputBg: "#FFFFFF",
};

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email: initialEmail } = useLocalSearchParams<{ email?: string }>();
  const [email] = useState(initialEmail || "");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
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
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      showErrorToast("Veuillez saisir le code complet");
      return;
    }

    setIsLoading(true);
    try {
      // On utilise notre route personnalisée qui gère mieux le type 'email-verification'
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp: otpCode }),
        },
      );

      const data = await response.json();

      if (!data.success) {
        showErrorToast(data.message || "Code invalide");
        return;
      }

      showSuccessToast("Compte vérifié avec succès !");
      router.replace("/(tabs)");
    } catch {
      showErrorToast("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setResendTimer(30);
    setCanResend(false);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/send-verification-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();

      if (!data.success) {
        showErrorToast(data.message || "Erreur lors de l'envoi");
      } else {
        showSuccessToast("Nouveau code envoyé !");
      }
    } catch {
      showErrorToast("Erreur lors de l'envoi");
    }
  };

  return (
    <LayoutAuth>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <HeaderAuth
            title="Vérifiez votre compte"
            subtitle="CODE DE SÉCURITÉ"
          />

          <View style={styles.content}>
            <Text style={styles.description}>
              Un code de vérification a été envoyé à{"\n"}
              <Text style={styles.emailText}>{email}</Text>
            </Text>

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
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            <View style={styles.footerActions}>
              <TouchableOpacity
                style={[styles.primaryBtn, isLoading && styles.btnDisabled]}
                onPress={handleVerify}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>Vérifier</Text>
                    <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                  </>
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
                    ? "Renvoyer le code"
                    : `Renvoyer dans ${resendTimer}s`}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.backBtnText}>Retour</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LayoutAuth>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
  content: { marginTop: 24, paddingHorizontal: 8 },
  description: {
    fontSize: 15,
    color: THEME.textSecondary,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  emailText: { color: THEME.textMain, fontWeight: "700" },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 32,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    fontSize: 24,
    fontWeight: "600",
    color: THEME.textMain,
    textAlign: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  otpInputFilled: {
    borderColor: THEME.textMain,
    backgroundColor: "#F9FAFB",
  },
  footerActions: { gap: 16 },
  primaryBtn: {
    backgroundColor: THEME.primary,
    height: 56,
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  btnDisabled: { opacity: 0.7 },
  primaryBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  resendBtn: { alignItems: "center", padding: 10 },
  resendText: {
    color: THEME.textMain,
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  resendTextDisabled: { color: "#9CA3AF", textDecorationLine: "none" },
  backBtn: { alignItems: "center", marginTop: 20, padding: 10 },
  backBtnText: { color: THEME.textSecondary, fontSize: 14, fontWeight: "600" },
});
