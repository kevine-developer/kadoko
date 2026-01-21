import { Ionicons } from "@expo/vector-icons";
import React, { useState, useRef, useEffect } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

interface VerifyOtpModalProps {
  visible: boolean;
  onClose: () => void;
  onVerified: () => void;
  email: string;
}

const THEME = {
  background: "#FDFBF7",
  textMain: "#111827",
  textSecondary: "#6B7280",
  primary: "#111827",
  border: "#E5E7EB",
  inputBg: "#FFFFFF",
};

export default function VerifyOtpModal({
  visible,
  onClose,
  onVerified,
  email,
}: VerifyOtpModalProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (!visible) {
      setOtp(["", "", "", "", "", ""]);
      setResendTimer(30);
      setCanResend(false);
      return;
    }

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
  }, [resendTimer, visible]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Handle paste for some platforms if needed, but here we keep it simple
      const val = value.slice(-1);
      const newOtp = [...otp];
      newOtp[index] = val;
      setOtp(newOtp);
      if (val && index < 5) inputRefs.current[index + 1]?.focus();
      return;
    }
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

      showSuccessToast("Email vérifié avec succès !");
      onVerified();
      onClose();
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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Vérifiez votre compte</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={THEME.textMain} />
              </TouchableOpacity>
            </View>

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

            <TouchableOpacity
              style={[styles.primaryBtn, isLoading && styles.btnDisabled]}
              onPress={handleVerify}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Vérifier le code</Text>
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
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: 20,
  },
  container: {
    width: "100%",
  },
  content: {
    backgroundColor: THEME.background,
    borderRadius: 24,
    padding: 24,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: THEME.textMain,
  },
  closeBtn: {
    padding: 4,
  },
  description: {
    fontSize: 14,
    color: THEME.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  emailText: {
    color: THEME.textMain,
    fontWeight: "700",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 8,
  },
  otpInput: {
    width: 40,
    height: 50,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 10,
    backgroundColor: THEME.inputBg,
    fontSize: 20,
    fontWeight: "700",
    color: THEME.textMain,
    textAlign: "center",
  },
  otpInputFilled: {
    borderColor: THEME.textMain,
    backgroundColor: "#F9FAFB",
  },
  primaryBtn: {
    backgroundColor: THEME.primary,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
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
  },
  resendText: {
    color: THEME.primary,
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  resendTextDisabled: {
    color: "#9CA3AF",
    textDecorationLine: "none",
  },
});
