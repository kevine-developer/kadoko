import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useRef } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";

// --- THEME ÉDITORIAL COHÉRENT ---
const THEME = {
  textMain: "#1A1A1A",
  white: "#FFFFFF",
  accent: "#AF9062", // Or brossé
};

interface CreateWishlistBannerProps {
  onPress: () => void;
}

export default function CreateWishlistBanner({
  onPress,
}: CreateWishlistBannerProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.99, // Mouvement très subtil pour garder la rigidité du luxe
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 60,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[styles.container, { transform: [{ scale: scaleAnim }] }]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.card}
      >
        {/* 1. BACKGROUND IMAGE (Sombre & Moody) */}
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?q=80&w=2788&auto=format&fit=crop",
          }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={800}
        />

        {/* 2. OVERLAY CINÉMATOGRAPHIQUE */}
        <View style={styles.overlay} />

        {/* 3. CADRE INTERNE DÉCORATIF (HAIRLINE) */}
        <View style={styles.innerFrame} />

        {/* 4. CONTENU ÉDITORIAL */}
        <View style={styles.content}>
          <View style={styles.topSection}>
            <View style={styles.accentLine} />
            <Text style={styles.badgeText}>NOUVEAU CHAPITRE</Text>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>
              Inaugurez votre{"\n"}première collection.
            </Text>
            <Text style={styles.subtitle}>
              Initiez un registre de vos envies et partagez-le avec votre cercle
              privé.
            </Text>
          </View>

          {/* BOUTON AUTHORITY RECTANGULAIRE */}
          <View style={styles.ctaButton}>
            <Text style={styles.ctaText}>COMMENCER</Text>
            <Ionicons name="arrow-forward" size={14} color={THEME.textMain} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 0,
    marginBottom: 40,
    marginTop: 10,
  },
  card: {
    height: 260,
    width: "100%",
    borderRadius: 0, // Rectangulaire pour le style magazine
    overflow: "hidden",
    position: "relative",
    justifyContent: "flex-end", // Contenu aligné en bas
  },

  /* OVERLAY */
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(26, 26, 26, 0.4)", // Voile noir élégant
  },

  /* CADRE INTERNE (Détail Luxe) */
  innerFrame: {
    position: "absolute",
    top: 15,
    left: 15,
    right: 15,
    bottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    zIndex: 1,
  },

  /* CONTENT */
  content: {
    padding: 35,
    zIndex: 2,
  },

  /* TOP LABEL */
  topSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 10,
  },
  accentLine: {
    width: 20,
    height: 1,
    backgroundColor: THEME.accent, // Or brossé
  },
  badgeText: {
    color: THEME.accent,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  /* TYPOGRAPHY */
  textContainer: {
    marginBottom: 25,
  },
  title: {
    fontSize: 32,
    color: THEME.white,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    lineHeight: 38,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 22,
    fontStyle: "italic",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    maxWidth: "90%",
  },

  /* CTA BUTTON */
  ctaButton: {
    backgroundColor: THEME.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    width: 160,
    borderRadius: 0, // Rectangulaire
  },
  ctaText: {
    color: THEME.textMain,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
});
