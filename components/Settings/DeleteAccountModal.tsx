import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (data: { password: string; otp?: string }) => void;
  isLoading?: boolean;
  email: string;
  requireOtp?: boolean;
}

const DeleteAccountModal = ({
  visible,
  onClose,
  onConfirm,
  isLoading = false,
  email,
  requireOtp = false,
}: DeleteAccountModalProps) => {
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false);

  const isValid = password.length > 0 && (!requireOtp || otp.length === 6);

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      // Import dynamique pour éviter les dépendances circulaires ou charger seulement si nécessaire
      const { authClient } = await import("@/lib/auth/auth-client");
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });
      // Import success toast
    } catch {
      // Import error toast
    } finally {
      setIsResending(false);
    }
  };

  const handleConfirm = () => {
    onConfirm({ password, otp: requireOtp ? otp : undefined });
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.warningIcon}>
                <Ionicons name="warning" size={32} color="#EF4444" />
              </View>
              <Text style={styles.title}>Supprimer le compte ?</Text>
              <Text style={styles.description}>
                Cette action est irréversible. Toutes vos wishlists et données
                seront définitivement supprimées.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>
                  Confirmer avec votre mot de passe
                </Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Mot de passe"
                  secureTextEntry
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {requireOtp && (
                <View style={styles.inputSection}>
                  <View style={styles.otpHeader}>
                    <Text style={styles.inputLabel}>
                      Code OTP (Email non vérifié)
                    </Text>
                    <TouchableOpacity
                      onPress={handleResendOtp}
                      disabled={isResending}
                    >
                      <Text style={styles.resendText}>
                        {isResending ? "Envoi..." : "Renvoyer"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={otp}
                    onChangeText={setOtp}
                    placeholder="123456"
                    keyboardType="number-pad"
                    maxLength={6}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              )}
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                disabled={isLoading}
              >
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmBtn,
                  (!isValid || isLoading) && styles.confirmBtnDisabled,
                ]}
                onPress={handleConfirm}
                disabled={!isValid || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.confirmBtnText}>Supprimer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default DeleteAccountModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  keyboardView: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  warningIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  otpHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resendText: {
    fontSize: 12,
    color: "#111827",
    fontWeight: "700",
    textDecorationLine: "underline",
    marginBottom: 8,
  },
  form: {
    gap: 16,
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#F3F4F6",
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  confirmBtn: {
    flex: 2,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnDisabled: {
    opacity: 0.5,
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
