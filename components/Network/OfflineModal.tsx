import React from "react";
import {
  Modal,
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
} from "react-native";
import { MotiView } from "moti";
import { useNetwork } from "@/hooks/useNetwork";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";

const OfflineModal = () => {
  const { isConnected } = useNetwork();
  const theme = useAppTheme();

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
      <View
        style={[
          styles.overlay,
          {
            backgroundColor:
              theme.background === "#FFFFFF"
                ? "rgba(0,0,0,0.4)"
                : "rgba(26, 26, 26, 0.85)",
          },
        ]}
      >
        <MotiView
          from={{ opacity: 0, scale: 0.98, translateY: 10 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 600 }}
          style={[
            styles.container,
            { backgroundColor: theme.background, borderColor: theme.border },
          ]}
        >
          <View style={[styles.topAccent, { backgroundColor: theme.accent }]} />

          <View style={styles.content}>
            <View
              style={[
                styles.iconWrapper,
                {
                  backgroundColor: theme.surface,
                  borderColor: `rgba(${theme.accent.replace(/[^0-9,]/g, "")}, 0.2)`,
                },
              ]}
            >
              <MotiView
                from={{ opacity: 0.3, scale: 1 }}
                animate={{ opacity: 0, scale: 1.4 }}
                transition={{
                  type: "timing",
                  duration: 2500,
                  loop: true,
                  repeatReverse: false,
                }}
                style={[styles.pulseRing, { borderColor: theme.accent }]}
              />
              <ThemedIcon
                name="cellular-outline"
                size={32}
                colorName="accent"
              />
            </View>

            <ThemedText type="hero" style={styles.title}>
              Interruption{"\n"}réseau.
            </ThemedText>
            <ThemedText
              type="subtitle"
              colorName="textSecondary"
              style={styles.description}
            >
              Votre accès au registre semble interrompu. Veuillez vérifier votre
              connexion internet pour poursuivre l&apos;expérience.
            </ThemedText>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.textMain }]}
              activeOpacity={0.9}
              onPress={handleRetry}
            >
              <ThemedText type="label" style={{ color: theme.background }}>
                TENTER DE RECONNECTER
              </ThemedText>
            </TouchableOpacity>

            <View style={[styles.footer, { borderTopColor: theme.border }]}>
              <ThemedText
                type="label"
                colorName="textSecondary"
                style={styles.footerText}
              >
                MODE HORS LIGNE ACTIF
              </ThemedText>
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  container: {
    width: "100%",
    borderRadius: 0,
    borderWidth: 1,
    overflow: "hidden",
    elevation: 20,
  },
  topAccent: { height: 3, width: "100%" },
  content: { padding: 32, alignItems: "center" },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
  },
  pulseRing: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
  },
  title: { textAlign: "center", marginBottom: 16 },
  description: { textAlign: "center", marginBottom: 35 },
  button: {
    width: "100%",
    height: 60,
    borderRadius: 0,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: 16,
    width: "100%",
    alignItems: "center",
  },
  footerText: { fontSize: 9, letterSpacing: 2 },
});
