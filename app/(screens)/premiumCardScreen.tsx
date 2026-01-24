import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { Image } from "expo-image";

// --- THEME ---
const THEME = {
  background: "#FDFBF7",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062", // Or brossé
  cardDark: "#111111", // Noir Matte
  cardGold: "#D4AF37", // Or Métallique
  border: "#E5E7EB",
};

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = CARD_WIDTH / 1.586; // Ratio Carte Bancaire Standard

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

  // Animation Flip
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [isFlipped, setIsFlipped] = useState(false);

  // Interpolation pour la face avant (0 -> 180deg)
  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  // Interpolation pour la face arrière (180 -> 360deg)
  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  // Gestion de l'opacité pour éviter le glitch visuel lors du croisement
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={[styles.navBar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="close" size={24} color={THEME.textMain} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>MEMBERSHIP</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TITRE SECTION */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={styles.headerText}
        >
          <Text style={styles.statusLabel}>STATUT ACTUEL</Text>
          <Text style={styles.tierTitle}>Membre Fondateur.</Text>
        </MotiView>

        {/* --- LA CARTE (FLIP) --- */}
        <View style={styles.cardContainer}>
          <TouchableOpacity activeOpacity={1} onPress={flipCard}>
            <View>
              {/* FACE AVANT */}
              <Animated.View
                style={[
                  styles.cardFace,
                  {
                    transform: [
                      { perspective: 1000 }, // ✅ CORRECTION : Perspective ici
                      { rotateY: frontInterpolate },
                    ],
                    opacity: frontOpacity, // Optimisation visuelle
                    zIndex: isFlipped ? 0 : 1, // Gestion Z-index pour les clics
                  },
                ]}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cardBrand}>GIFTFLOW</Text>
                    <Ionicons
                      name="wifi"
                      size={24}
                      color="rgba(255,255,255,0.4)"
                      style={{ transform: [{ rotate: "90deg" }] }}
                    />
                  </View>

                  <View style={styles.chip} />

                  <View style={styles.cardBottom}>
                    <View>
                      <Text style={styles.cardNumber}>•••• •••• •••• 8842</Text>
                      <Text style={styles.cardName}>ALEXANDRE DUMAS</Text>
                    </View>
                    <Text style={styles.cardDate}>09/28</Text>
                  </View>
                </View>
                {/* Reflet Or */}
                <View style={styles.goldBorder} />
              </Animated.View>

              {/* FACE ARRIÈRE */}
              <Animated.View
                style={[
                  styles.cardFace,
                  styles.cardBackAbsolute, // Position absolute pour superposer
                  {
                    transform: [
                      { perspective: 1000 }, // ✅ CORRECTION
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
                    <Text style={styles.cvv}>884</Text>
                  </View>
                  <View style={styles.qrContainer}>
                    <Image
                      source={{
                        uri: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=GIFTFLOW_MEMBER_8842&bgcolor=111111&color=D4AF37",
                      }}
                      style={styles.qrCode}
                    />
                    <View style={{ flex: 1, marginLeft: 15 }}>
                      <Text style={styles.scanTitle}>CODE MEMBRE</Text>
                      <Text style={styles.scanText}>
                        Ce code est personnel et permet l&apos;accès prioritaire.
                      </Text>
                    </View>
                  </View>
                </View>
              </Animated.View>
            </View>
          </TouchableOpacity>

          <Text style={styles.tapHint}>TOUCHER LA CARTE POUR RETOURNER</Text>
        </View>

        {/* --- LISTE DES AVANTAGES --- */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>VOS PRIVILÈGES</Text>
          <View style={styles.divider} />

          {BENEFITS.map((benefit, index) => (
            <MotiView
              key={benefit.id}
              from={{ opacity: 0, translateX: -10 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ delay: index * 100 + 300 }}
              style={styles.benefitRow}
            >
              <View style={styles.benefitIcon}>
                <Ionicons
                  name={benefit.icon as any}
                  size={20}
                  color={THEME.accent}
                />
              </View>
              <View style={styles.benefitText}>
                <Text style={styles.benefitName}>{benefit.title}</Text>
                <Text style={styles.benefitDesc}>{benefit.desc}</Text>
              </View>
              <Ionicons name="checkmark" size={16} color={THEME.textMain} />
            </MotiView>
          ))}
        </View>

        {/* FOOTER ACTION */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.walletBtn}>
            <Ionicons name="wallet-outline" size={20} color="#FFF" />
            <Text style={styles.walletText}>AJOUTER À APPLE WALLET</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },

  /* NAV BAR */
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  iconBtn: { padding: 5 },
  navTitle: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    color: THEME.textMain,
  },

  scrollContent: { paddingBottom: 50 },

  /* HEADER TEXT */
  headerText: { paddingHorizontal: 30, marginBottom: 30 },
  statusLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: THEME.accent,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  tierTitle: {
    fontSize: 36,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
  },

  /* CARD WRAPPER */
  cardContainer: { alignItems: "center", marginBottom: 40 },

  cardFace: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    backgroundColor: THEME.cardDark,
    backfaceVisibility: "hidden", // Crucial pour le flip
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

  /* CARD FRONT DESIGN */
  goldBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)", // Or subtil
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
    fontWeight: "800",
    letterSpacing: 2,
  },

  chip: {
    width: 45,
    height: 35,
    borderRadius: 6,
    backgroundColor: "#D4AF37", // Gold chip
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
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  cardDate: { color: "#FFF", fontSize: 12, fontWeight: "600" },

  /* CARD BACK DESIGN */
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
    color: THEME.accent,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 4,
  },
  scanText: { color: "rgba(255,255,255,0.6)", fontSize: 10, lineHeight: 14 },

  tapHint: {
    marginTop: 25,
    fontSize: 9,
    fontWeight: "700",
    color: THEME.textSecondary,
    letterSpacing: 1,
  },

  /* BENEFITS */
  benefitsSection: { paddingHorizontal: 30 },
  benefitsTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 15,
  },
  divider: { height: 1, backgroundColor: THEME.border, marginBottom: 20 },

  benefitRow: { flexDirection: "row", alignItems: "center", marginBottom: 25 },
  benefitIcon: { width: 40, alignItems: "center" },
  benefitText: { flex: 1, paddingRight: 20 },
  benefitName: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.textMain,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  benefitDesc: { fontSize: 12, color: THEME.textSecondary, lineHeight: 18 },

  /* FOOTER */
  footer: { paddingHorizontal: 30, marginTop: 20 },
  walletBtn: {
    backgroundColor: "#000",
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 0, // Rectangulaire luxe
  },
  walletText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
});
