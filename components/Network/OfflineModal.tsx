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
import { MotiView } from "moti";
import { useNetwork } from "@/hooks/useNetwork";
import * as Haptics from "expo-haptics";

// --- THEME ÉDITORIAL COHÉRENT ---
const THEME = {
  overlay: "rgba(26, 26, 26, 0.85)", // Fond sombre soyeux
  background: "#FDFBF7", // Bone Silk
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.08)",
};

const OfflineModal = () => {
  const { isConnected } = useNetwork();

  // On déclenche un retour haptique léger quand la connexion est perdue
  React.useEffect(() => {
    if (isConnected === false) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [isConnected]);

  if (isConnected !== false) return null;

  const handleRetry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={true}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <MotiView
          from={{ opacity: 0, scale: 0.98, translateY: 10 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 600 }}
          style={styles.container}
        >
          {/* LIGNE D'ACCENTUATION OR EN HAUT */}
          <View style={styles.topAccent} />

          <View style={styles.content}>
            {/* ICONE BIJOU */}
            <View style={styles.iconWrapper}>
              <MotiView
                from={{ opacity: 0.3, scale: 1 }}
                animate={{ opacity: 0, scale: 1.4 }}
                transition={{
                  type: "timing",
                  duration: 2500,
                  loop: true,
                  repeatReverse: false,
                }}
                style={styles.pulseRing}
              />
              <Ionicons
                name="cellular-outline"
                size={32}
                color={THEME.accent}
              />
            </View>

            {/* TITRE ÉDITORIAL */}
            <Text style={styles.title}>Interruption{"\n"}réseau.</Text>

            {/* DESCRIPTION MANUSCRITE */}
            <Text style={styles.description}>
              Votre accès au registre semble interrompu. Veuillez vérifier votre
              connexion internet pour poursuivre l&apos;expérience.
            </Text>

            {/* BOUTON AUTHORITY RECTANGULAIRE */}
            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.9}
              onPress={handleRetry}
            >
              <Text style={styles.buttonText}>TENTER DE RECONNECTER</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>MODE HORS LIGNE ACTIF</Text>
            </View>
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
    backgroundColor: THEME.overlay,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  container: {
    width: "100%",
    backgroundColor: THEME.background,
    borderRadius: 0, // Rectangulaire luxe
    borderWidth: 1,
    borderColor: THEME.border,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 20,
  },
  topAccent: {
    height: 3,
    backgroundColor: THEME.accent,
    width: "100%",
  },
  content: {
    padding: 32,
    alignItems: "center",
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(175, 144, 98, 0.2)",
  },
  pulseRing: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: THEME.accent,
  },
  title: {
    fontSize: 28,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    textAlign: "center",
    lineHeight: 32,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 14,
    color: THEME.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    fontStyle: "italic",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginBottom: 35,
  },
  button: {
    width: "100%",
    height: 60,
    backgroundColor: THEME.textMain,
    borderRadius: 0, // Rectangulaire luxe
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    paddingTop: 16,
    width: "100%",
    alignItems: "center",
  },
  footerText: {
    fontSize: 9,
    color: THEME.textSecondary,
    fontWeight: "800",
    letterSpacing: 2,
  },
});