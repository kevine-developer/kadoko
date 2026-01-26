import React, { useEffect } from "react";
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
import { useServerError } from "@/hooks/useServerError";
import * as Haptics from "expo-haptics";

// --- THEME ÉDITORIAL COHÉRENT ---
const THEME = {
  overlay: "rgba(26, 26, 26, 0.9)", // Fond très sombre et profond
  background: "#FDFBF7", // Bone Silk
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  danger: "#C34A4A", // Rouge Brique (Luxe)
  border: "rgba(0,0,0,0.08)",
};

const ServerErrorModal = () => {
  const { hasServerError, setServerError } = useServerError();

  useEffect(() => {
    if (hasServerError) {
      // Vibration d'erreur subtile mais perceptible
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [hasServerError]);

  if (!hasServerError) return null;

  const handleRetry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setServerError(false);
    // Ici, vous pourriez ajouter une logique de "reload" réel si nécessaire
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
          {/* LIGNE D'ACCENTUATION ROUGE BRIQUE */}
          <View style={styles.topAccent} />

          <View style={styles.content}>
            {/* ICONE AVEC PULSE LENT */}
            <View style={styles.iconWrapper}>
              <MotiView
                from={{ opacity: 0.2, scale: 1 }}
                animate={{ opacity: 0, scale: 1.3 }}
                transition={{
                  type: "timing",
                  duration: 2000,
                  loop: true,
                }}
                style={styles.pulseRing}
              />
              <Ionicons name="server-outline" size={32} color={THEME.danger} />
              <View style={styles.alertBadge}>
                <Ionicons name="alert" size={10} color="#FFF" />
              </View>
            </View>

            {/* TITRE SÉRIEUX & ÉLÉGANT */}
            <Text style={styles.title}>
              Service{"\n"}momentanément interrompu.
            </Text>

            {/* DESCRIPTION RASSURANTE */}
            <Text style={styles.description}>
              Une opération technique affecte nos serveurs. Nos équipes
              rétablissent la liaison pour garantir la sécurité de vos données.
            </Text>

            {/* BOUTON AUTHORITY */}
            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.9}
              onPress={handleRetry}
            >
              <Text style={styles.buttonText}>ACTUALISER LA CONNEXION</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>DIAGNOSTIC : ERREUR 500</Text>
            </View>
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
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 25,
  },
  topAccent: {
    height: 3,
    backgroundColor: THEME.danger,
    width: "100%",
  },
  content: {
    padding: 32,
    alignItems: "center",
  },
  iconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: THEME.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(195, 74, 74, 0.2)", // Rouge brique très pâle
    position: "relative",
  },
  pulseRing: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: THEME.danger,
  },
  alertBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: THEME.danger,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: THEME.surface,
  },
  title: {
    fontSize: 26,
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
    backgroundColor: THEME.danger, // Rouge Brique pour l'action correctrice
    borderRadius: 0, // Rectangulaire
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
    letterSpacing: 1.5,
  },
});
