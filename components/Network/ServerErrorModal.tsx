import React, { useEffect } from "react";
import {
  Modal,
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
} from "react-native";
import { MotiView } from "moti";
import { useServerError } from "@/hooks/useServerError";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";

const ServerErrorModal = () => {
  const { hasServerError, setServerError } = useServerError();
  const theme = useAppTheme();

  useEffect(() => {
    if (hasServerError) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [hasServerError]);

  if (!hasServerError) return null;

  const handleRetry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setServerError(false);
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
                : "rgba(26, 26, 26, 0.9)",
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
          <View style={[styles.topAccent, { backgroundColor: theme.danger }]} />

          <View style={styles.content}>
            <View
              style={[
                styles.iconWrapper,
                {
                  backgroundColor: theme.surface,
                  borderColor: `rgba(${theme.danger.replace(/[^0-9,]/g, "")}, 0.2)`,
                },
              ]}
            >
              <MotiView
                from={{ opacity: 0.2, scale: 1 }}
                animate={{ opacity: 0, scale: 1.3 }}
                transition={{
                  type: "timing",
                  duration: 2000,
                  loop: true,
                }}
                style={[styles.pulseRing, { borderColor: theme.danger }]}
              />
              <ThemedIcon name="server-outline" size={32} colorName="danger" />
              <View
                style={[
                  styles.alertBadge,
                  { backgroundColor: theme.danger, borderColor: theme.surface },
                ]}
              >
                <ThemedIcon name="alert" size={10} colorName="background" />
              </View>
            </View>

            <ThemedText type="hero" style={styles.title}>
              Service{"\n"}momentanément interrompu.
            </ThemedText>

            <ThemedText
              type="subtitle"
              colorName="textSecondary"
              style={styles.description}
            >
              Une opération technique affecte nos serveurs. Nos équipes
              rétablissent la liaison pour garantir la sécurité de vos données.
            </ThemedText>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.danger }]}
              activeOpacity={0.9}
              onPress={handleRetry}
            >
              <ThemedText type="label" style={{ color: theme.background }}>
                ACTUALISER LA CONNEXION
              </ThemedText>
            </TouchableOpacity>

            <View style={[styles.footer, { borderTopColor: theme.border }]}>
              <ThemedText
                type="label"
                colorName="textSecondary"
                style={styles.footerText}
              >
                DIAGNOSTIC : ERREUR 500
              </ThemedText>
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  container: {
    width: "100%",
    borderRadius: 0,
    borderWidth: 1,
    overflow: "hidden",
    elevation: 25,
  },
  topAccent: { height: 3, width: "100%" },
  content: { padding: 32, alignItems: "center" },
  iconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    position: "relative",
  },
  pulseRing: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
  },
  alertBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
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
  footerText: { fontSize: 9, letterSpacing: 1.5 },
});
