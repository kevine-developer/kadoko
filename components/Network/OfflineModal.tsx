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
import { useNetwork } from "@/hooks/useNetwork";

const OfflineModal = () => {
  const { isConnected } = useNetwork();

  if (isConnected !== false) return null;

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
            <View style={styles.iconPulse}>
              <MotiView
                from={{ scale: 1, opacity: 0.3 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{
                  type: "timing",
                  duration: 2000,
                  loop: true,
                  repeatReverse: false,
                }}
                style={styles.pulseDisk}
              />
              <Ionicons
                name="cloud-offline-outline"
                size={48}
                color="#EF4444"
              />
            </View>
          </View>

          <MotiText
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 300 }}
            style={styles.title}
          >
            Oups ! Connexion perdue
          </MotiText>

          <Text style={styles.description}>
            Il semble que vous soyez hors ligne. Vérifiez votre connexion
            internet pour continuer à utiliser Kadoko.
          </Text>

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={() => {
              // Le hook useNetwork mettra à jour l'état automatiquement
              // On peut éventuellement ajouter un vibreur ou un toast ici
            }}
          >
            <Text style={styles.buttonText}>RÉESSAYER</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Ionicons name="wifi-outline" size={14} color="#9CA3AF" />
            <Text style={styles.footerText}>En attente du réseau...</Text>
          </View>
        </MotiView>
      </View>
    </Modal>
  );
};

export default OfflineModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.8)", // Gris très foncé semi-transparent
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
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 15,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconPulse: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  pulseDisk: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#EF4444",
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
    backgroundColor: "#111827",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#111827",
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
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerText: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "500",
  },
});
