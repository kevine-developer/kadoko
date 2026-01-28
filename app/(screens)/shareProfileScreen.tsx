import { useRouter } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import {
  Dimensions,
  ScrollView,
  Share,
  StyleSheet,
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
import { MotiView } from "moti";
import { showSuccessToast } from "@/lib/toast";
import { CameraView, useCameraPermissions } from "expo-camera";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";

const { width } = Dimensions.get("window");

export default function ShareProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
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
    setTimeout(() => setScanned(false), 2000);
  };

  const renderScanner = () => {
    if (!permission?.granted) {
      return (
        <View style={styles.permissionContainer}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <ThemedIcon name="camera-outline" size={32} colorName="accent" />
          </View>
          <ThemedText type="title" style={styles.permissionTitle}>
            Caméra Requise
          </ThemedText>
          <ThemedText
            type="subtitle"
            colorName="textSecondary"
            style={styles.permissionText}
          >
            Pour identifier vos proches, nous avons besoin d&apos;accéder à
            votre appareil photo.
          </ThemedText>
          <TouchableOpacity
            onPress={requestPermission}
            style={[styles.primaryBtn, { backgroundColor: theme.textMain }]}
          >
            <ThemedText type="label" style={{ color: theme.background }}>
              AUTORISER L&lsquo;ACCÈS
            </ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={[styles.cameraWrapper, { borderColor: theme.border }]}
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
              <View
                style={[
                  styles.corner,
                  styles.topLeft,
                  { borderColor: theme.accent },
                ]}
              />
              <View
                style={[
                  styles.corner,
                  styles.topRight,
                  { borderColor: theme.accent },
                ]}
              />
              <View
                style={[
                  styles.corner,
                  styles.bottomLeft,
                  { borderColor: theme.accent },
                ]}
              />
              <View
                style={[
                  styles.corner,
                  styles.bottomRight,
                  { borderColor: theme.accent },
                ]}
              />
              <Animated.View
                style={[
                  styles.laser,
                  {
                    backgroundColor: theme.accent,
                    transform: [{ translateY: scanAnim }],
                  },
                ]}
              />
            </View>
            <View style={styles.overlayDark} />
          </View>
          <View style={[styles.overlayDark, styles.overlayBottom]}>
            <ThemedText type="label" style={styles.scanInstruction}>
              Cadrez le code de votre ami
            </ThemedText>
            <TouchableOpacity
              style={styles.flashBtn}
              onPress={() => setFlash(!flash)}
            >
              <ThemedIcon
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
        style={[
          styles.cardContainer,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        {hasUsername ? (
          <>
            <View style={styles.cardHeader}>
              <Image
                source={{ uri: user?.image }}
                style={[
                  styles.avatar,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                  },
                ]}
              />
              <View style={{ flex: 1 }}>
                <ThemedText type="subtitle" style={styles.userName}>
                  {user?.name}
                </ThemedText>
                <ThemedText
                  type="label"
                  colorName="accent"
                  style={styles.userHandle}
                >
                  @{username}
                </ThemedText>
              </View>
              <ThemedIcon
                name="checkmark-circle"
                size={24}
                colorName="accent"
              />
            </View>

            <View style={[styles.qrWrapper, { borderColor: theme.border }]}>
              <Image
                source={{ uri: qrCodeUrl }}
                style={styles.qrImage}
                contentFit="contain"
              />
            </View>

            <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
              <View>
                <ThemedText
                  type="label"
                  colorName="textSecondary"
                  style={styles.footerLabel}
                >
                  MEMBRE DEPUIS
                </ThemedText>
                <ThemedText type="default" bold style={styles.footerValue}>
                  2024
                </ThemedText>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <ThemedText
                  type="label"
                  colorName="textSecondary"
                  style={styles.footerLabel}
                >
                  IDENTITÉ
                </ThemedText>
                <ThemedText type="default" bold style={styles.footerValue}>
                  CERTIFIÉE
                </ThemedText>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.noUsernameContainer}>
            <ThemedIcon name="at-outline" size={48} colorName="border" />
            <ThemedText type="title" style={styles.noUsernameTitle}>
              Alias requis
            </ThemedText>
            <ThemedText
              type="subtitle"
              colorName="textSecondary"
              style={styles.noUsernameSubtitle}
            >
              Définissez un pseudonyme pour générer votre carte de membre.
            </ThemedText>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: theme.textMain }]}
              onPress={() =>
                router.push("/(screens)/setupScreens/usernameSetupScreen")
              }
            >
              <ThemedText type="label" style={{ color: theme.background }}>
                CONFIGURER
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </MotiView>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: theme.textMain }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Share.share({
              message: `Rejoins mon cercle sur GiftFlow : ${profileLink}`,
            });
          }}
        >
          <ThemedText type="label" style={{ color: theme.background }}>
            PARTAGER MA CARTE
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionBtnSecondary,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
          onPress={() => {
            Clipboard.setStringAsync(profileLink);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            showSuccessToast("Lien copié");
          }}
        >
          <ThemedIcon name="copy-outline" size={20} colorName="textMain" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.navBar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ThemedIcon name="chevron-down" size={26} colorName="textMain" />
        </TouchableOpacity>

        <View style={styles.toggleContainer}>
          {["MY_CODE", "SCAN"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.toggleBtn,
                activeTab === tab && [
                  styles.toggleBtnActive,
                  { backgroundColor: theme.surface },
                ],
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab as any);
              }}
            >
              <ThemedText
                type="label"
                style={[
                  styles.toggleText,
                  { color: theme.textSecondary },
                  activeTab === tab && { color: theme.textMain },
                ]}
              >
                {tab === "MY_CODE" ? "Ma Carte" : "Scanner"}
              </ThemedText>
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
  container: { flex: 1 },
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
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  toggleText: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
  content: { flex: 1 },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 40,
    paddingHorizontal: 32,
  },
  cardContainer: {
    width: width - 64,
    borderRadius: 0,
    padding: 30,
    marginTop: 20,
    marginBottom: 40,
    borderWidth: 1,
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
    borderWidth: 1,
  },
  userName: {
    fontSize: 20,
    letterSpacing: -0.5,
  },
  userHandle: {
    fontSize: 12,
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
  },
  qrImage: { width: "100%", height: "100%" },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    paddingTop: 20,
  },
  footerLabel: {
    fontSize: 8,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  footerValue: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
  cameraWrapper: {
    flex: 1,
    marginHorizontal: 32,
    marginBottom: 40,
    overflow: "hidden",
    borderWidth: 1,
  },
  overlayContainer: { ...StyleSheet.absoluteFillObject },
  overlayDark: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
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
    borderWidth: 3,
  },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  laser: {
    width: "90%",
    height: 1.5,
    alignSelf: "center",
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
  actionsRow: { flexDirection: "row", gap: 12, width: "100%" },
  primaryBtn: {
    flex: 1,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnSecondary: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
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
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    borderWidth: 1,
  },
  permissionTitle: {
    marginBottom: 15,
  },
  permissionText: {
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 35,
  },
  noUsernameContainer: { alignItems: "center", paddingVertical: 20 },
  noUsernameTitle: {
    marginTop: 15,
  },
  noUsernameSubtitle: {
    textAlign: "center",
    fontSize: 13,
    marginTop: 10,
    marginBottom: 25,
    lineHeight: 18,
  },
});
