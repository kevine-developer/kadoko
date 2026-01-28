import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { Image } from "expo-image";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = CARD_WIDTH / 1.586;

const BENEFITS = [
  {
    id: 1,
    title: "COUPE-FILE",
    desc: "Priorité absolue sur les listes d'attente des objets rares.",
    icon: "flash-outline",
  },
  {
    id: 2,
    title: "PRIVILÈGE PRIX",
    desc: "-15% automatique sur la sélection 'Édito'.",
    icon: "pricetag-outline",
  },
  {
    id: 3,
    title: "CONCIERGERIE",
    desc: "Accès direct au support prioritaire 24/7.",
    icon: "chatbubble-ellipses-outline",
  },
];

export default function PremiumCardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

  const animatedValue = useRef(new Animated.Value(0)).current;
  const [isFlipped, setIsFlipped] = useState(false);

  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  const frontOpacity = animatedValue.interpolate({
    inputRange: [89, 90],
    outputRange: [1, 0],
  });

  const backOpacity = animatedValue.interpolate({
    inputRange: [89, 90],
    outputRange: [0, 1],
  });

  const flipCard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isFlipped) {
      Animated.spring(animatedValue, {
        toValue: 0,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(animatedValue, {
        toValue: 180,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
    }
    setIsFlipped(!isFlipped);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={
          theme.background === "#1A1A1A" ? "light-content" : "dark-content"
        }
      />

      <View style={[styles.navBar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ThemedIcon name="close" size={24} colorName="textMain" />
        </TouchableOpacity>
        <ThemedText type="label" style={styles.navTitle}>
          MEMBERSHIP
        </ThemedText>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={styles.headerText}
        >
          <ThemedText
            type="label"
            colorName="accent"
            style={styles.statusLabel}
          >
            STATUT ACTUEL
          </ThemedText>
          <ThemedText type="hero" style={styles.tierTitle}>
            Membre Fondateur.
          </ThemedText>
        </MotiView>

        <View style={styles.cardContainer}>
          <TouchableOpacity activeOpacity={1} onPress={flipCard}>
            <View>
              <Animated.View
                style={[
                  styles.cardFace,
                  {
                    backgroundColor: "#111111", // Toujours sombre pour le luxe
                    transform: [
                      { perspective: 1000 },
                      { rotateY: frontInterpolate },
                    ],
                    opacity: frontOpacity,
                    zIndex: isFlipped ? 0 : 1,
                  },
                ]}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardTop}>
                    <ThemedText type="label" style={styles.cardBrand}>
                      GIFTFLOW
                    </ThemedText>
                    <ThemedIcon
                      name="wifi"
                      size={24}
                      color="rgba(255,255,255,0.4)"
                      // style={{ transform: [{ rotate: "90deg" }] }}
                    />
                  </View>

                  <View style={styles.chip} />

                  <View style={styles.cardBottom}>
                    <View>
                      <ThemedText style={styles.cardNumber}>
                        •••• •••• •••• 8842
                      </ThemedText>
                      <ThemedText type="label" style={styles.cardName}>
                        ALEXANDRE DUMAS
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.cardDate}>09/28</ThemedText>
                  </View>
                </View>
                <View style={styles.goldBorder} />
              </Animated.View>

              <Animated.View
                style={[
                  styles.cardFace,
                  styles.cardBackAbsolute,
                  {
                    backgroundColor: "#111111",
                    transform: [
                      { perspective: 1000 },
                      { rotateY: backInterpolate },
                    ],
                    opacity: backOpacity,
                    zIndex: isFlipped ? 1 : 0,
                  },
                ]}
              >
                <View style={styles.magneticStrip} />
                <View style={styles.cardBackContent}>
                  <View style={styles.signatureRow}>
                    <View style={styles.signatureArea} />
                    <ThemedText style={styles.cvv}>884</ThemedText>
                  </View>
                  <View style={styles.qrContainer}>
                    <Image
                      source={{
                        uri: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=GIFTFLOW_MEMBER_8842&bgcolor=111111&color=D4AF37",
                      }}
                      style={styles.qrCode}
                    />
                    <View style={{ flex: 1, marginLeft: 15 }}>
                      <ThemedText
                        type="label"
                        colorName="accent"
                        style={styles.scanTitle}
                      >
                        CODE MEMBRE
                      </ThemedText>
                      <ThemedText type="caption" style={styles.scanText}>
                        Ce code est personnel et permet l&apos;accès
                        prioritaire.
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </Animated.View>
            </View>
          </TouchableOpacity>

          <ThemedText
            type="label"
            colorName="textSecondary"
            style={styles.tapHint}
          >
            TOUCHER LA CARTE POUR RETOURNER
          </ThemedText>
        </View>

        <View style={styles.benefitsSection}>
          <ThemedText
            type="label"
            colorName="textSecondary"
            style={styles.benefitsTitle}
          >
            VOS PRIVILÈGES
          </ThemedText>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {BENEFITS.map((benefit, index) => (
            <MotiView
              key={benefit.id}
              from={{ opacity: 0, translateX: -10 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ delay: index * 100 + 300 }}
              style={styles.benefitRow}
            >
              <View style={styles.benefitIcon}>
                <ThemedIcon
                  name={benefit.icon as any}
                  size={20}
                  colorName="accent"
                />
              </View>
              <View style={styles.benefitText}>
                <ThemedText type="default" bold style={styles.benefitName}>
                  {benefit.title}
                </ThemedText>
                <ThemedText
                  type="caption"
                  colorName="textSecondary"
                  style={styles.benefitDesc}
                >
                  {benefit.desc}
                </ThemedText>
              </View>
              <ThemedIcon name="checkmark" size={16} colorName="textMain" />
            </MotiView>
          ))}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.walletBtn}>
            <ThemedIcon name="wallet-outline" size={20} color="#FFF" />
            <ThemedText type="label" style={styles.walletText}>
              AJOUTER À APPLE WALLET
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  iconBtn: { padding: 5 },
  navTitle: {
    letterSpacing: 2,
  },
  scrollContent: { paddingBottom: 50 },
  headerText: { paddingHorizontal: 30, marginBottom: 30 },
  statusLabel: {
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  tierTitle: {
    fontSize: 36,
  },
  cardContainer: { alignItems: "center", marginBottom: 40 },
  cardFace: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    backfaceVisibility: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 15,
  },
  cardBackAbsolute: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  goldBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    borderRadius: 16,
  },
  cardContent: { flex: 1, padding: 25, justifyContent: "space-between" },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardBrand: {
    color: "#FFF",
    fontSize: 14,
    letterSpacing: 2,
  },
  chip: {
    width: 45,
    height: 35,
    borderRadius: 6,
    backgroundColor: "#D4AF37",
    opacity: 0.8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.2)",
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  cardNumber: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    marginBottom: 5,
    letterSpacing: 2,
  },
  cardName: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    letterSpacing: 1.5,
  },
  cardDate: { color: "#FFF", fontSize: 12, fontWeight: "600" },
  magneticStrip: {
    width: "100%",
    height: 45,
    backgroundColor: "#000",
    marginTop: 25,
  },
  cardBackContent: { padding: 25, paddingTop: 15 },
  signatureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  signatureArea: {
    flex: 1,
    height: 35,
    backgroundColor: "#EEE",
    marginRight: 10,
    justifyContent: "center",
  },
  cvv: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  qrContainer: { flexDirection: "row", alignItems: "center" },
  qrCode: { width: 60, height: 60, backgroundColor: "white", borderRadius: 4 },
  scanTitle: {
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 4,
  },
  scanText: { color: "rgba(255,255,255,0.6)", fontSize: 10, lineHeight: 14 },
  tapHint: {
    marginTop: 25,
    fontSize: 9,
    letterSpacing: 1,
  },
  benefitsSection: { paddingHorizontal: 30 },
  benefitsTitle: {
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 15,
  },
  divider: { height: 1, marginBottom: 20 },
  benefitRow: { flexDirection: "row", alignItems: "center", marginBottom: 25 },
  benefitIcon: { width: 40, alignItems: "center" },
  benefitText: { flex: 1, paddingRight: 20 },
  benefitName: {
    fontSize: 14,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  benefitDesc: { fontSize: 12, lineHeight: 18 },
  footer: { paddingHorizontal: 30, marginTop: 20 },
  walletBtn: {
    backgroundColor: "#000",
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 0,
  },
  walletText: {
    color: "#FFF",
    fontSize: 11,
    letterSpacing: 1,
  },
});
