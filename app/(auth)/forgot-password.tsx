import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import { showErrorToast, showSuccessToast } from "../../lib/toast";
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
  Keyboard,
} from "react-native";
import * as Haptics from "expo-haptics";
import { MotiView, AnimatePresence } from "moti";
import {
  authService,
  HeaderAuth,
  LayoutAuth,
  InputCustom,
  FormError,
} from "@/features/auth";

// --- THEME ÉDITORIAL COHÉRENT ---
const THEME = {
  background: "#FDFBF7", // Bone Silk
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.08)",
  success: "#4A6741",
  primary: "#1A1A1A",
};

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { email: initialEmail } = useLocalSearchParams<{ email?: string }>();

  // States
  const [step, setStep] = useState<1 | 2 | 3>(initialEmail ? 2 : 1);
  const [email, setEmail] = useState(initialEmail || "");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Timer State
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const [errors, setErrors] = useState<{
    email?: string;
    otp?: string;
    password?: string;
    confirm?: string;
  }>({});

  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (resendTimer > 0 && step === 2) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer, step]);

  const handleSendOTP = async () => {
    if (!email.trim()) {
      setErrors({ email: "Identifiant requis" });
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const response = await authService.forgotPassword(email.trim());
      if (response.success) {
        showSuccessToast("Code de sécurité transmis");
        setStep(2);
        setResendTimer(30);
      } else {
        setServerError(response.message);
      }
    } catch {
      setServerError("Erreur de communication");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const char = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);
    if (char) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (index < 5) inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = () => {
    if (otp.join("").length !== 6) {
      setErrors({ otp: "Signature incomplète" });
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStep(3);
  };

  const handleResetPassword = async () => {
    if (isLoading) return;

    if (newPassword !== confirmPassword) {
      setErrors({ confirm: "Les signatures ne correspondent pas" });
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      const response = await authService.resetPassword(
        email,
        otp.join(""),
        newPassword,
      );
      if (response.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showSuccessToast("Sécurité mise à jour");
        router.replace("/sign-in");
      } else {
        setServerError(response.message);
      }
    } catch {
      setServerError("Erreur système");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LayoutAuth>
      <View style={[styles.navBar]}>
        <TouchableOpacity
          onPress={() =>
            step > 1 ? setStep((step - 1) as any) : router.back()
          }
        >
          <Ionicons name="chevron-back" size={24} color={THEME.textMain} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{`RÉCUPÉRATION ${step}/3`}</Text>
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
          <HeaderAuth
            title={
              step === 1
                ? "Mot de passe oublié ?"
                : step === 2
                  ? "Vérification."
                  : "Signature."
            }
            subtitle={
              step === 1
                ? "SÉCURITÉ"
                : step === 2
                  ? "CONFIRMATION"
                  : "RESTAURATION"
            }
          />

          <FormError message={serverError} />

          {/* STEP 1: EMAIL */}
          {step === 1 && (
            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Text style={styles.description}>
                Veuillez saisir l&apos;adresse associée à votre compte pour
                recevoir une signature numérique temporaire.
              </Text>
              <InputCustom
                label="VOTRE EMAIL"
                placeholder="nom@domaine.com"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setErrors({});
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleSendOTP}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.primaryBtnText}>DEMANDER UN CODE</Text>
                )}
              </TouchableOpacity>
            </MotiView>
          )}

          {/* STEP 2: OTP */}
          {step === 2 && (
            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Text style={styles.description}>
                Un code de sécurité a été transmis à l&apos;adresse suivante :{"\n"}
                <Text style={styles.emailHighlight}>{email}</Text>
              </Text>
              <View style={styles.otpWrapper}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    style={[
                      styles.otpInput,
                      {
                        borderBottomColor: digit ? THEME.accent : THEME.border,
                      },
                    ]}
                    value={digit}
                    onChangeText={(v) => handleOtpChange(v, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                  />
                ))}
              </View>
              {errors.otp && (
                <Text style={styles.errorTextCenter}>{errors.otp}</Text>
              )}

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleVerifyOTP}
              >
                <Text style={styles.primaryBtnText}>VÉRIFIER LA SIGNATURE</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendBtn}
                onPress={handleSendOTP}
                disabled={!canResend}
              >
                <Text
                  style={[styles.resendText, !canResend && { opacity: 0.5 }]}
                >
                  {canResend ? "RENVOYER LE CODE" : `ATTENDRE ${resendTimer}S`}
                </Text>
              </TouchableOpacity>
            </MotiView>
          )}

          {/* STEP 3: RESET */}
          {step === 3 && (
            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Text style={styles.description}>
                Code vérifié. Veuillez définir votre nouvelle signature de
                sécurité.
              </Text>
              <InputCustom
                label="NOUVEAU MOT DE PASSE"
                placeholder="••••••••"
                value={newPassword}
                onChangeText={(t) => {
                  setNewPassword(t);
                  setErrors({});
                }}
                secureTextEntry
                error={errors.password}
              />
              <InputCustom
                label="CONFIRMATION"
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t);
                  setErrors({});
                }}
                secureTextEntry
                error={errors.confirm}
              />
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.primaryBtnText}>
                    RÉINITIALISER LE COMPTE
                  </Text>
                )}
              </TouchableOpacity>
            </MotiView>
          )}

          <TouchableOpacity
            style={styles.backToLogin}
            onPress={() => router.replace("/sign-in")}
          >
            <Text style={styles.backToLoginText}>RETOUR À LA CONNEXION</Text>
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
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1.5,
  },
  scrollContent: {
    flexGrow: 1,
  },
  description: {
    fontSize: 14,
    color: THEME.textSecondary,
    lineHeight: 22,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontStyle: "italic",
    marginBottom: 35,
  },
  emailHighlight: {
    color: THEME.textMain,
    fontWeight: "700",
    fontStyle: "normal",
  },
  /* OTP */
  otpWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  otpInput: {
    width: 40,
    height: 54,
    borderBottomWidth: 1,
    fontSize: 24,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    textAlign: "center",
  },
  /* BUTTONS */
  primaryBtn: {
    backgroundColor: THEME.primary,
    height: 60,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  resendBtn: {
    marginTop: 25,
    alignItems: "center",
  },
  resendText: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.accent,
    letterSpacing: 1,
    textDecorationLine: "underline",
  },
  backToLogin: {
    marginTop: 40,
    alignItems: "center",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  backToLoginText: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1.5,
  },
  errorTextCenter: {
    color: THEME.accent,
    fontSize: 12,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "600",
  },
});
