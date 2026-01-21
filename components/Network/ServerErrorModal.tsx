import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView, MotiText } from "moti";
import { useServerError } from "@/hooks/useServerError";

const ServerErrorModal = () => {
  const { hasServerError, setServerError } = useServerError();

  if (!hasServerError) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={true}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <MotiView
          from={{ opacity: 0, scale: 0.9, translateY: 20 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: "spring", damping: 15 }}
          style={styles.container}
        >
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="server-outline" size={48} color="#EF4444" />
              <MotiView
                from={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: "timing",
                  duration: 500,
                  loop: true,
                  repeatReverse: true,
                }}
                style={styles.alertBadge}
              >
                <Ionicons name="alert-circle" size={24} color="#EF4444" />
              </MotiView>
            </View>
          </View>

          <MotiText
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 300 }}
            style={styles.title}
          >
            Le serveur fait une sieste...
          </MotiText>

          <Text style={styles.description}>
            Nous rencontrons une difficulté technique momentanée. Nos équipes
            (ou plutôt nos serveurs) font tout pour revenir en ligne rapidement
            !
          </Text>

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={() => {
              setServerError(false);
              // Optionnel : Recharger l'app ou la session si besoin
            }}
          >
            <Text style={styles.buttonText}>RÉESSAYER</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Erreur technique détectée (500)
            </Text>
          </View>
        </MotiView>
      </View>
    </Modal>
  );
};

export default ServerErrorModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.9)", // Plus sombre pour l'erreur serveur
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  container: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 20,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderWidth: 2,
    borderColor: "#FEE2E2",
  },
  alertBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-black",
  },
  description: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  button: {
    width: "100%",
    height: 56,
    backgroundColor: "#EF4444", // Rouge pour l'erreur
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  footer: {
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
