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
} from "react-native";
import {
  authService,
  HeaderAuth,
  LayoutAuth,
  InputCustom,
  FormError,
} from "@/features/auth";

const THEME = {
  background: "#FDFBF7",
  textMain: "#111827",
  textSecondary: "#6B7280",
  primary: "#111827",
  border: "#E5E7EB",
  inputBg: "#FFFFFF",
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
  const [showPassword, setShowPassword] = useState(false);
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

  // Gestion du Timer pour le renvoi de code
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

  // ÉTAPE 1 : Envoyer le code OTP
  const handleSendOTP = async () => {
    setServerError(null);
    if (!email.trim()) {
      setErrors({ ...errors, email: "Veuillez saisir votre adresse email" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(email.trim());
      if (response.success) {
        showSuccessToast(response.message);
        setStep(2);
        setResendTimer(30);
        setCanResend(false);
      } else {
        setServerError(response.message);
      }
    } catch {
      setServerError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setResendTimer(30);
    setCanResend(false);
    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        showSuccessToast("Code renvoyé !");
      } else {
        showErrorToast(response.message);
      }
    } catch {
      showErrorToast("Erreur lors du renvoi");
    }
  };

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

  // ÉTAPE 2 : Valider l'OTP (format uniquement, pas d'appel API)
  const handleVerifyOTP = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setErrors({ ...errors, otp: "Veuillez saisir le code complet" });
      return;
    }

    // On passe directement à l'étape 3 sans vérifier le code
    // La vérification se fera lors de la réinitialisation finale
    showSuccessToast("Code saisi !");
    setStep(3);
  };

  // ÉTAPE 3 : Réinitialiser le mot de passe
  const isSubmitting = useRef(false);

  const handleResetPassword = async () => {
    // Empêcher les doubles soumissions
    if (isSubmitting.current || isLoading) {
      console.log("[RESET] Soumission déjà en cours, ignoré");
      return;
    }

    const newErrors: any = {};
    if (!newPassword || newPassword.length < 8) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 8 caractères";
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirm = "Les mots de passe ne correspondent pas";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    isSubmitting.current = true;
    setIsLoading(true);

    try {
      const otpCode = otp.join("");
      console.log("[RESET] Envoi de la requête de réinitialisation");

      const response = await authService.resetPassword(
        email,
        otpCode,
        newPassword,
      );

      if (response.success) {
        showSuccessToast("Mot de passe mis à jour !");
        router.replace("/sign-in");
      } else {
        setServerError(response.message);
      }
    } catch (error) {
      console.error("[RESET] Erreur:", error);
      setServerError("Erreur serveur");
    } finally {
      setIsLoading(false);
      // Attendre un peu avant de permettre une nouvelle soumission
      setTimeout(() => {
        isSubmitting.current = false;
      }, 1000);
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
            title={
              step === 1
                ? "Mot de passe oublié ?"
                : step === 2
                  ? "Vérification"
                  : "Nouveau mot de passe"
            }
            subtitle={`ÉTAPE ${step}/3`}
          />

          <View style={{ paddingHorizontal: 20 }}>
            <FormError message={serverError} />
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={styles.progressLine} />
            <View
              style={[
                styles.progressDot,
                step >= 2 && styles.progressDotActive,
              ]}
            />
            <View style={styles.progressLine} />
            <View
              style={[
                styles.progressDot,
                step === 3 && styles.progressDotActive,
              ]}
            />
          </View>

          <View style={styles.content}>
            {step === 1 && (
              // ÉTAPE 1 : Saisie de l'email
              <>
                <Text style={styles.description}>
                  Saisissez votre adresse email pour recevoir un code de
                  vérification.
                </Text>

                <View style={styles.section}>
                  <InputCustom
                    icon="mail-outline"
                    placeholder="Adresse email"
                    value={email}
                    onChangeText={(t) => {
                      setEmail(t);
                      if (errors.email)
                        setErrors({ ...errors, email: undefined });
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email}
                  />
                </View>

                <View style={styles.footerActions}>
                  <TouchableOpacity
                    style={[styles.primaryBtn, isLoading && styles.btnDisabled]}
                    onPress={handleSendOTP}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <>
                        <Text style={styles.primaryBtnText}>
                          Envoyer le code
                        </Text>
                        <Ionicons name="send-outline" size={18} color="#FFF" />
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}

            {step === 2 && (
              // ÉTAPE 2 : Saisie et validation OTP
              <>
                <Text style={styles.description}>
                  Un code a été envoyé à{"\n"}
                  <Text style={styles.emailText}>{email}</Text>
                </Text>

                <View style={styles.section}>
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
                        caretHidden
                      />
                    ))}
                  </View>
                  {errors.otp && (
                    <Text
                      style={{
                        color: "#EF4444",
                        fontSize: 12,
                        marginTop: 8,
                        textAlign: "center",
                      }}
                    >
                      {errors.otp}
                    </Text>
                  )}
                </View>

                <View style={styles.footerActions}>
                  <TouchableOpacity
                    style={[styles.primaryBtn, isLoading && styles.btnDisabled]}
                    onPress={handleVerifyOTP}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <>
                        <Text style={styles.primaryBtnText}>
                          Vérifier le code
                        </Text>
                        <Ionicons name="arrow-forward" size={18} color="#FFF" />
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
              </>
            )}

            {step === 3 && (
              // ÉTAPE 3 : Saisie du nouveau mot de passe
              <>
                <View style={styles.successIndicator}>
                  <View style={styles.successIconBox}>
                    <Ionicons
                      name="checkmark-circle"
                      size={48}
                      color="#10B981"
                    />
                  </View>
                  <Text style={styles.successText}>
                    Code vérifié avec succès
                  </Text>
                </View>

                <View style={styles.section}>
                  <View style={{ marginBottom: 16 }}>
                    <InputCustom
                      icon="lock-closed-outline"
                      placeholder="Nouveau mot de passe"
                      value={newPassword}
                      onChangeText={(t) => {
                        setNewPassword(t);
                        if (errors.password)
                          setErrors({ ...errors, password: undefined });
                      }}
                      secureTextEntry={!showPassword}
                      showPassword={() => setShowPassword(!showPassword)}
                      error={errors.password}
                    />
                  </View>

                  <View>
                    <InputCustom
                      icon="shield-checkmark-outline"
                      placeholder="Confirmer le mot de passe"
                      value={confirmPassword}
                      onChangeText={(t) => {
                        setConfirmPassword(t);
                        if (errors.confirm)
                          setErrors({ ...errors, confirm: undefined });
                      }}
                      secureTextEntry={!showPassword}
                      showPassword={() => setShowPassword(!showPassword)}
                      error={errors.confirm}
                    />
                  </View>
                </View>

                <View style={styles.footerActions}>
                  <TouchableOpacity
                    style={[styles.primaryBtn, isLoading && styles.btnDisabled]}
                    onPress={handleResetPassword}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <>
                        <Text style={styles.primaryBtnText}>
                          Réinitialiser le mot de passe
                        </Text>
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={20}
                          color="#FFF"
                        />
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Bouton permanent vers la connexion */}
            <TouchableOpacity
              style={styles.backToLoginBtn}
              onPress={() => router.replace("/sign-in")}
            >
              <Ionicons
                name="arrow-back"
                size={16}
                color={THEME.textSecondary}
              />
              <Text style={styles.backToLoginText}>Retour à la connexion</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LayoutAuth>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    marginTop: 24,
    paddingHorizontal: 8,
  },

  /* PROGRESS INDICATOR */
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 24,
    paddingHorizontal: 40,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E5E7EB",
  },
  progressDotActive: {
    backgroundColor: THEME.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 12,
  },

  /* SUCCESS INDICATOR */
  successIndicator: {
    alignItems: "center",
    marginBottom: 32,
  },
  successIconBox: {
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10B981",
  },

  description: {
    fontSize: 15,
    color: THEME.textSecondary,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  emailText: {
    color: THEME.textMain,
    fontWeight: "700",
  },
  section: {
    marginBottom: 24,
  },

  /* OTP STYLES */
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
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

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 32,
    width: "60%",
    alignSelf: "center",
  },

  /* PASSWORD STYLES */
  inputLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#9CA3AF",
    letterSpacing: 1.5,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.inputBg,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 14,
    height: 54,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: THEME.textMain,
    height: "100%",
  },
  eyeBtn: {
    padding: 8,
  },

  /* BUTTONS */
  footerActions: {
    marginTop: 24,
    gap: 20,
  },
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
  btnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  resendBtn: {
    alignItems: "center",
    padding: 10,
  },
  resendText: {
    color: THEME.textMain,
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  resendTextDisabled: {
    color: "#9CA3AF",
    textDecorationLine: "none",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
  },
  backBtnText: {
    color: THEME.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  backToLoginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    marginTop: 24,
    marginBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  backToLoginText: {
    color: THEME.textMain,
    fontSize: 14,
    fontWeight: "700",
  },
});
