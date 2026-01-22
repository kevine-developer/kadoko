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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authClient } from "@/features/auth";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import ButtonUI from "@/components/btn-ui";

const THEME = {
  background: "#FDFBF7",
  surface: "#FFFFFF",
  textMain: "#111827",
  textSecondary: "#6B7280",
  primary: "#111827",
  border: "rgba(0,0,0,0.06)",
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
    if (value.length > 1) {
      // Gérer le copier-coller si possible, sinon tronquer
      value = value.charAt(0);
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus prochain input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
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
      showErrorToast("Veuillez saisir le code complet");
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      // On utilise la route personnalisée du backend qui gère mieux le type 'email-verification'
      const response = (await authClient.$fetch("/api/auth/verify-otp", {
        method: "POST",
        body: { email, otp: otpCode },
      })) as any;

      if (!response.success) {
        showErrorToast(response.message || "Code invalide ou expiré");
      } else {
        showSuccessToast(
          type === "change-email" ? "Email mis à jour !" : "Compte vérifié !",
        );

        // Si c'était un changement d'email, on retourne aux paramètres
        if (type === "change-email") {
          router.dismiss(2); // Retourne à Settings (depuis Verify <- ChangeEmail)
        } else {
          router.replace("/(tabs)");
        }
      }
    } catch (err) {
      showErrorToast("Une erreur est survenue");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setResendTimer(30);
    setCanResend(false);

    try {
      // On utilise la route personnalisée du backend
      const response = (await authClient.$fetch(
        "/api/auth/send-verification-otp",
        {
          method: "POST",
          body: { email },
        },
      )) as any;

      if (!response.success) {
        showErrorToast(response.message || "Erreur lors de l'envoi");
      } else {
        showSuccessToast("Nouveau code envoyé !");
      }
    } catch (err) {
      showErrorToast("Erreur lors de l'envoi");
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Ionicons name="arrow-back" size={24} color={THEME.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vérification</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.introSection}>
            <Text style={styles.title}>Confirmez votre email</Text>
            <Text style={styles.subtitle}>
              Saisissez le code à 6 chiffres envoyé à{"\n"}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
                value={digit}
                onChangeText={(val) => handleOtpChange(val, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          <View style={{ marginTop: 20 }}>
            <ButtonUI
              title="Vérifier le code"
              onPress={handleVerify}
              loading={loading}
              variant="primary"
            />
          </View>

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
                ? "Je n'ai pas reçu le code. Renvoyer."
                : `Renvoyer le code dans ${resendTimer}s`}
            </Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    backgroundColor: THEME.background,
    zIndex: 10,
  },
  navBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
  },
  scrollContent: {
    padding: 24,
  },
  introSection: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: THEME.textMain,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: THEME.textSecondary,
    lineHeight: 22,
    textAlign: "center",
  },
  emailHighlight: {
    color: THEME.textMain,
    fontWeight: "700",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  otpInput: {
    width: 48,
    height: 64,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    backgroundColor: "#FFF",
    fontSize: 28,
    fontWeight: "700",
    color: THEME.textMain,
    textAlign: "center",
    // Simulation de profondeur
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  otpInputFilled: {
    borderColor: THEME.primary,
    backgroundColor: "#F8FAFC",
  },
  resendBtn: {
    marginTop: 32,
    alignItems: "center",
    padding: 10,
  },
  resendText: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.textMain,
    textDecorationLine: "underline",
  },
  resendTextDisabled: {
    color: "#9CA3AF",
    textDecorationLine: "none",
  },
});
