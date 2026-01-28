import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import {
  authService,
  HeaderAuth,
  LayoutAuth,
  InputCustom,
  FormError,
  PasswordRequirements,
} from "@/features/auth";
import { showSuccessToast } from "@/lib/toast";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";

// --- THEME ÉDITORIAL ---

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const theme = useAppTheme();
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

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,20}$/;
    if (!newPassword) {
      setErrors({ password: "Le mot de passe est requis" });
      return;
    }
    if (newPassword.length < 8 || newPassword.length > 20) {
      setErrors({ password: "Entre 8 et 20 caractères requis" });
      return;
    }
    if (!passwordRegex.test(newPassword)) {
      setErrors({ password: "La sécurité n'est pas respectée" });
      return;
    }

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
          <ThemedIcon name="chevron-back" size={24} colorName="textMain" />
        </TouchableOpacity>
        <ThemedText
          type="label"
          style={styles.navTitle}
        >{`RÉCUPÉRATION ${step}/3`}</ThemedText>
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
              <ThemedText type="subtitle" style={styles.description}>
                Veuillez saisir l&apos;adresse associée à votre compte pour
                recevoir une signature numérique temporaire.
              </ThemedText>
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
                style={[styles.primaryBtn, { backgroundColor: theme.textMain }]}
                onPress={handleSendOTP}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={theme.background} size="small" />
                ) : (
                  <ThemedText
                    type="label"
                    style={[styles.primaryBtnText, { color: theme.background }]}
                  >
                    DEMANDER UN CODE
                  </ThemedText>
                )}
              </TouchableOpacity>
            </MotiView>
          )}

          {/* STEP 2: OTP */}
          {step === 2 && (
            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ThemedText type="subtitle" style={styles.description}>
                Un code de sécurité a été transmis à l&apos;adresse suivante :
                {"\n"}
                <ThemedText type="default" bold style={styles.emailHighlight}>
                  {email}
                </ThemedText>
              </ThemedText>
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
                        borderBottomColor: digit ? theme.accent : theme.border,
                        color: theme.textMain,
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
                <ThemedText
                  type="caption"
                  colorName="accent"
                  style={styles.errorTextCenter}
                >
                  {errors.otp}
                </ThemedText>
              )}

              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: theme.textMain }]}
                onPress={handleVerifyOTP}
              >
                <ThemedText
                  type="label"
                  style={[styles.primaryBtnText, { color: theme.background }]}
                >
                  VÉRIFIER LA SIGNATURE
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendBtn}
                onPress={handleSendOTP}
                disabled={!canResend}
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
                  {canResend ? "RENVOYER LE CODE" : `ATTENDRE ${resendTimer}S`}
                </ThemedText>
              </TouchableOpacity>
            </MotiView>
          )}

          {/* STEP 3: RESET */}
          {step === 3 && (
            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ThemedText type="subtitle" style={styles.description}>
                Code vérifié. Veuillez définir votre nouvelle signature de
                sécurité.
              </ThemedText>
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
              <PasswordRequirements
                password={newPassword}
                visible={newPassword.length > 0}
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
                style={[styles.primaryBtn, { backgroundColor: theme.textMain }]}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={theme.background} size="small" />
                ) : (
                  <ThemedText
                    type="label"
                    style={[styles.primaryBtnText, { color: theme.background }]}
                  >
                    RÉINITIALISER LE COMPTE
                  </ThemedText>
                )}
              </TouchableOpacity>
            </MotiView>
          )}

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
  },
  emailHighlight: {
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
    textAlign: "center",
  },
  /* BUTTONS */
  primaryBtn: {
    height: 60,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  primaryBtnText: {
    fontSize: 13,
    letterSpacing: 1.5,
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
    marginTop: 40,
    alignItems: "center",
    paddingVertical: 15,
    borderTopWidth: 1,
  },
  backToLoginText: {
    fontSize: 10,
    letterSpacing: 1.5,
  },
  errorTextCenter: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 20,
  },
});
