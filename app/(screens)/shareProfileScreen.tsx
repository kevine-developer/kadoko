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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authClient } from "@/features/auth";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { showSuccessToast } from "@/lib/toast";
import { CameraView, useCameraPermissions } from "expo-camera";

const { width } = Dimensions.get("window");

const THEME = {
  background: "#FDFBF7", // Crème luxe
  surface: "#FFFFFF",
  textMain: "#111827",
  textSecondary: "#6B7280",
  primary: "#111827", // Noir profond
  accent: "#D4AF37", // Or (discret)
  border: "rgba(0,0,0,0.06)",
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

  // Animation du laser
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

    // Logique de redirection ici
    showSuccessToast("Profil détecté !");
    setTimeout(() => setScanned(false), 2000); // Reset après 2s
  };

  const renderScanner = () => {
    if (!permission?.granted) {
      return (
        <View style={styles.permissionContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="camera-outline" size={32} color={THEME.textMain} />
          </View>
          <Text style={styles.permissionTitle}>Accès à la caméra</Text>
          <Text style={styles.permissionText}>
            Pour scanner le profil d&apos;un ami, nous avons besoin de votre
            autorisation.
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            style={styles.actionBtnPrimary}
          >
            <Text style={styles.btnTextPrimary}>Autoriser l&apos;accès</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.cameraWrapper}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          enableTorch={flash}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        />

        {/* MASQUE DE SCANNER PROFESSIONNEL */}
        <View style={styles.overlayContainer}>
          <View style={styles.overlayDark} />
          <View style={styles.overlayMiddle}>
            <View style={styles.overlayDark} />
            <View style={styles.scanWindow}>
              {/* Coins du scanner */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />

              {/* Ligne laser animée */}
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
              Positionnez le code dans le cadre
            </Text>

            <TouchableOpacity
              style={styles.flashBtn}
              onPress={() => setFlash(!flash)}
            >
              <Ionicons
                name={flash ? "flash" : "flash-off"}
                size={24}
                color="#FFF"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderMyCode = () => (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.cardContainer}>
        {hasUsername ? (
          <>
            <View style={styles.cardHeader}>
              <Image
                source={{ uri: user?.image || "https://i.pravatar.cc/150" }}
                style={styles.avatar}
              />
              <View>
                <Text style={styles.userName}>
                  {user?.name || "Membre Premium"}
                </Text>
                <Text style={styles.userHandle}>@{username}</Text>
              </View>
              <View style={styles.badge}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={THEME.accent}
                />
              </View>
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
              <Image
                source={require("@/assets/images/icon.png")} // Remplacez par votre logo
                style={styles.miniLogo}
              />
            </View>
          </>
        ) : (
          /* ... État sans username identique ... */
          <View style={styles.noUsernameContainer}>
            <Ionicons name="at-circle-outline" size={64} color="#E5E7EB" />
            <Text style={styles.noUsernameTitle}>Pseudo requis</Text>
            <TouchableOpacity
              style={styles.setupBtn}
              onPress={() => router.push("/(screens)/usernameSetupScreen")}
            >
              <Text style={styles.setupBtnText}>Configurer</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionBtnPrimary}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Share.share({ message: `Rejoins mon cercle : ${profileLink}` });
          }}
        >
          <Text style={styles.btnTextPrimary}>Partager</Text>
          <Ionicons name="share-outline" size={18} color="#FFF" />
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
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={THEME.textMain} />
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
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {activeTab === "MY_CODE" ? renderMyCode() : renderScanner()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.border,
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
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  toggleText: { fontSize: 13, fontWeight: "600", color: THEME.textSecondary },
  toggleTextActive: { color: THEME.textMain },

  content: { flex: 1 },
  scrollContent: { alignItems: "center", paddingBottom: 40 },

  /* CARD STYLE */
  cardContainer: {
    backgroundColor: "#FFF",
    width: width * 0.88,
    borderRadius: 30,
    padding: 24,
    marginTop: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.08,
    shadowRadius: 25,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 25 },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: THEME.background,
  },
  userName: {
    fontSize: 17,
    fontWeight: "700",
    color: THEME.textMain,
    letterSpacing: -0.5,
  },
  userHandle: { fontSize: 13, color: THEME.textSecondary, marginTop: 2 },
  badge: { marginLeft: "auto" },
  qrWrapper: {
    aspectRatio: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },
  qrImage: { width: "100%", height: "100%" },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 20,
  },
  footerLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1,
  },
  footerValue: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.textMain,
    marginTop: 2,
  },
  miniLogo: { width: 24, height: 24, opacity: 0.8, grayscale: 1 } as any,

  /* SCANNER OVERLAY */
  cameraWrapper: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: 30,
    overflow: "hidden",
  },
  overlayContainer: { ...StyleSheet.absoluteFillObject },
  overlayDark: { flex: 1, backgroundColor: THEME.overlay },
  overlayMiddle: { flexDirection: "row", height: 240 },
  scanWindow: { width: 240, height: 240, position: "relative" },
  overlayBottom: { alignItems: "center", paddingTop: 30 },
  scanInstruction: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 20,
  },

  corner: {
    position: "absolute",
    width: 25,
    height: 25,
    borderColor: "#FFF",
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 15,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 15,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 15,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 15,
  },

  laser: {
    width: "90%",
    height: 2,
    backgroundColor: THEME.accent,
    alignSelf: "center",
    shadowColor: THEME.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
  flashBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  /* ACTIONS */
  actionsRow: { flexDirection: "row", paddingHorizontal: 25, gap: 12 },
  actionBtnPrimary: {
    flex: 1,
    height: 56,
    backgroundColor: THEME.primary,
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  actionBtnSecondary: {
    width: 56,
    height: 56,
    backgroundColor: "#FFF",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.border,
  },
  btnTextPrimary: { color: "#FFF", fontSize: 16, fontWeight: "600" },

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
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  permissionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 10 },
  permissionText: {
    textAlign: "center",
    color: THEME.textSecondary,
    lineHeight: 22,
    marginBottom: 30,
  },

  noUsernameContainer: { alignItems: "center", padding: 20 },
  noUsernameTitle: { fontSize: 18, fontWeight: "600", marginTop: 10 },
  setupBtn: {
    marginTop: 15,
    padding: 12,
    backgroundColor: THEME.primary,
    borderRadius: 12,
  },
  setupBtnText: { color: "#FFF", fontWeight: "600" },
});
