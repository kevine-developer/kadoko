import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import {
  Dimensions,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Easing,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authClient } from "@/features/auth";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { MotiView, AnimatePresence } from "moti";
import { showSuccessToast } from "@/lib/toast";
import { CameraView, useCameraPermissions } from "expo-camera";

const { width } = Dimensions.get("window");

const THEME = {
  background: "#FDFBF7", // Bone Silk
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  primary: "#1A1A1A",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.08)",
  overlay: "rgba(0,0,0,0.6)",
};

export default function ShareProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: session } = authClient.useSession();
  const user = session?.user as any;

  const [activeTab, setActiveTab] = useState<"MY_CODE" | "SCAN">("MY_CODE");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flash, setFlash] = useState(false);

  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (activeTab === "SCAN") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 220,
            duration: 2000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [activeTab, scanAnim]);

  const username = user?.username;
  const hasUsername = typeof username === "string" && username.length >= 3;
  const profileLink = hasUsername ? Linking.createURL(`user/${username}`) : "";

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
    profileLink,
  )}&bgcolor=FFFFFF&color=111827&margin=10&format=png`;

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showSuccessToast("Profil détecté !");
    // Redirection vers le profil scanné ici
    setTimeout(() => setScanned(false), 2000);
  };

  const renderScanner = () => {
    if (!permission?.granted) {
      return (
        <View style={styles.permissionContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="camera-outline" size={32} color={THEME.accent} />
          </View>
          <Text style={styles.permissionTitle}>Caméra Requise</Text>
          <Text style={styles.permissionText}>
            Pour identifier vos proches, nous avons besoin d&apos;accéder à votre
            appareil photo.
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnText}>AUTORISER L&lsquo;ACCÈS</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={styles.cameraWrapper}
      >
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          enableTorch={flash}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        />
        <View style={styles.overlayContainer}>
          <View style={styles.overlayDark} />
          <View style={styles.overlayMiddle}>
            <View style={styles.overlayDark} />
            <View style={styles.scanWindow}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              <Animated.View
                style={[
                  styles.laser,
                  { transform: [{ translateY: scanAnim }] },
                ]}
              />
            </View>
            <View style={styles.overlayDark} />
          </View>
          <View style={[styles.overlayDark, styles.overlayBottom]}>
            <Text style={styles.scanInstruction}>
              Cadrez le code de votre ami
            </Text>
            <TouchableOpacity
              style={styles.flashBtn}
              onPress={() => setFlash(!flash)}
            >
              <Ionicons
                name={flash ? "flash" : "flash-off"}
                size={22}
                color="#FFF"
              />
            </TouchableOpacity>
          </View>
        </View>
      </MotiView>
    );
  };

  const renderMyCode = () => (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={styles.cardContainer}
      >
        {hasUsername ? (
          <>
            <View style={styles.cardHeader}>
              <Image source={{ uri: user?.image }} style={styles.avatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{user?.name}</Text>
                <Text style={styles.userHandle}>@{username}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={24} color={THEME.accent} />
            </View>

            <View style={styles.qrWrapper}>
              <Image
                source={{ uri: qrCodeUrl }}
                style={styles.qrImage}
                contentFit="contain"
              />
            </View>

            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.footerLabel}>MEMBRE DEPUIS</Text>
                <Text style={styles.footerValue}>2024</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.footerLabel}>IDENTITÉ</Text>
                <Text style={styles.footerValue}>CERTIFIÉE</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.noUsernameContainer}>
            <Ionicons name="at-outline" size={48} color={THEME.border} />
            <Text style={styles.noUsernameTitle}>Alias requis</Text>
            <Text style={styles.noUsernameSubtitle}>
              Définissez un pseudonyme pour générer votre carte de membre.
            </Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => router.push("/(screens)/usernameSetupScreen")}
            >
              <Text style={styles.primaryBtnText}>CONFIGURER</Text>
            </TouchableOpacity>
          </View>
        )}
      </MotiView>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Share.share({
              message: `Rejoins mon cercle sur GiftFlow : ${profileLink}`,
            });
          }}
        >
          <Text style={styles.primaryBtnText}>PARTAGER MA CARTE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtnSecondary}
          onPress={() => {
            Clipboard.setStringAsync(profileLink);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            showSuccessToast("Lien copié");
          }}
        >
          <Ionicons name="copy-outline" size={20} color={THEME.textMain} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* NAV BAR */}
      <View style={[styles.navBar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-down" size={26} color={THEME.textMain} />
        </TouchableOpacity>

        <View style={styles.toggleContainer}>
          {["MY_CODE", "SCAN"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.toggleBtn,
                activeTab === tab && styles.toggleBtnActive,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab as any);
              }}
            >
              <Text
                style={[
                  styles.toggleText,
                  activeTab === tab && styles.toggleTextActive,
                ]}
              >
                {tab === "MY_CODE" ? "Ma Carte" : "Scanner"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        {activeTab === "MY_CODE" ? renderMyCode() : renderScanner()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },

  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.04)",
    borderRadius: 25,
    padding: 4,
    width: 200,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 21,
  },
  toggleBtnActive: {
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  toggleText: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  toggleTextActive: { color: THEME.textMain },

  content: { flex: 1 },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 40,
    paddingHorizontal: 32,
  },

  /* CARD STYLE - LUXE */
  cardContainer: {
    backgroundColor: THEME.surface,
    width: width - 64,
    borderRadius: 0, // Rectangulaire luxe
    padding: 30,
    marginTop: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 5,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 30 },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 0,
    marginRight: 15,
    backgroundColor: THEME.background,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  userName: {
    fontSize: 20,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    letterSpacing: -0.5,
  },
  userHandle: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.accent,
    marginTop: 2,
    letterSpacing: 0.5,
  },

  qrWrapper: {
    aspectRatio: 1,
    backgroundColor: "#F9F6F0",
    borderRadius: 0,
    padding: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  qrImage: { width: "100%", height: "100%" },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    paddingTop: 20,
  },
  footerLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  footerValue: {
    fontSize: 11,
    fontWeight: "700",
    color: THEME.textMain,
    letterSpacing: 0.5,
  },

  /* SCANNER */
  cameraWrapper: {
    flex: 1,
    marginHorizontal: 32,
    marginBottom: 40,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: THEME.border,
  },
  overlayContainer: { ...StyleSheet.absoluteFillObject },
  overlayDark: { flex: 1, backgroundColor: THEME.overlay },
  overlayMiddle: { flexDirection: "row", height: 240 },
  scanWindow: { width: 240, height: 240, position: "relative" },
  overlayBottom: { alignItems: "center", paddingTop: 30 },
  scanInstruction: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 20,
    opacity: 0.8,
  },

  corner: {
    position: "absolute",
    width: 20,
    height: 20,
    borderColor: THEME.accent,
    borderWidth: 3,
  },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },

  laser: {
    width: "90%",
    height: 1.5,
    backgroundColor: THEME.accent,
    alignSelf: "center",
    shadowColor: THEME.accent,
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  flashBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  /* BUTTONS */
  actionsRow: { flexDirection: "row", gap: 12, width: "100%" },
  primaryBtn: {
    flex: 1,
    height: 60,
    backgroundColor: THEME.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  actionBtnSecondary: {
    width: 60,
    height: 60,
    backgroundColor: THEME.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.border,
  },

  /* PERMISSION */
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  permissionTitle: {
    fontSize: 22,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginBottom: 15,
    color: THEME.textMain,
  },
  permissionText: {
    textAlign: "center",
    color: THEME.textSecondary,
    lineHeight: 22,
    marginBottom: 35,
    fontStyle: "italic",
  },

  noUsernameContainer: { alignItems: "center", paddingVertical: 20 },
  noUsernameTitle: {
    fontSize: 18,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginTop: 15,
    color: THEME.textMain,
  },
  noUsernameSubtitle: {
    textAlign: "center",
    color: THEME.textSecondary,
    fontSize: 13,
    marginTop: 10,
    marginBottom: 25,
    lineHeight: 18,
  },
});
