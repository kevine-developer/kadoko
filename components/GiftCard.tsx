import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { WishlistPhotoSummary } from "@/lib/getWishlistPhotos";
import { WishlistVisibility } from "@/types/gift";

// --- THEME ---
const THEME = {
  surface: "#FFFFFF",
  textMain: "#111827",
  textSecondary: "#6B7280",
  border: "rgba(0,0,0,0.06)",
  placeholder: "#F3F4F6",
};

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.45;
const IMAGE_HEIGHT = 170; // Légèrement plus haut pour l'élégance

// --- SOUS-COMPOSANT : GRILLE "BENTO" ---
const ImageGrid = ({ images }: { images?: string[] }) => {
  const count = images?.length ?? 0;
  const GAP = 2; // Espacement très fin blanc pour effet mosaïque

  if (count === 0) {
    return (
      <View style={[styles.gridContainer, styles.placeholder]}>
        <Ionicons name="images-outline" size={24} color="#9CA3AF" />
      </View>
    );
  }

  // Helper pour les images
  const RenderImage = ({ uri, style }: { uri: string; style: any }) => (
    <Image source={{ uri }} style={style} contentFit="cover" transition={400} />
  );

  if (count === 1) {
    return (
      <View style={styles.gridContainer}>
        <RenderImage uri={images![0]} style={styles.imgFull} />
      </View>
    );
  }

  if (count === 2) {
    return (
      <View style={[styles.gridContainer, { flexDirection: "row", gap: GAP }]}>
        <RenderImage uri={images![0]} style={styles.flex1} />
        <RenderImage uri={images![1]} style={styles.flex1} />
      </View>
    );
  }

  if (count === 3) {
    return (
      <View style={[styles.gridContainer, { flexDirection: "row", gap: GAP }]}>
        <RenderImage uri={images![0]} style={styles.flex2} />
        <View style={[styles.flex1, { gap: GAP }]}>
          <RenderImage uri={images![1]} style={styles.flex1} />
          <RenderImage uri={images![2]} style={styles.flex1} />
        </View>
      </View>
    );
  }

  // 4+ Images
  return (
    <View style={[styles.gridContainer, { gap: GAP }]}>
      <View style={[styles.row, { flex: 2, gap: GAP }]}>
        <RenderImage uri={images![0]} style={styles.flex2} />
        <RenderImage uri={images![1]} style={styles.flex1} />
      </View>
      <View style={[styles.row, { flex: 1, gap: GAP }]}>
        <RenderImage uri={images![2]} style={styles.flex1} />
        <RenderImage uri={images![3]} style={styles.flex1} />
      </View>
    </View>
  );
};

// --- COMPOSANT PRINCIPAL ---
export default function GiftWishlistCard({
  wishlistId,
  wishlistTitle,
  totalGifts,
  wishlistVisibility,
  images,
}: WishlistPhotoSummary) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
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

  const navigateToGiftGroup = () => {
    router.push({
      pathname: "/gifts/wishlists/[wishlistId]",
      params: { wishlistId: wishlistId },
    });
  };

  const isPrivate = wishlistVisibility === WishlistVisibility.PRIVATE;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={1}
        onPress={navigateToGiftGroup}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {/* FRAME VISUEL */}
        <View style={styles.frame}>
          <ImageGrid images={images?.slice(0, 4)} />

          {/* Compteur "Galerie" */}
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{totalGifts}</Text>
          </View>
        </View>

        {/* INFO */}
        <View style={styles.metaInfo}>
          {/* Statut minimaliste */}
          <View style={styles.statusRow}>
            <Ionicons
              name={isPrivate ? "lock-closed-outline" : "globe-outline"}
              size={10}
              color={THEME.textSecondary}
            />
            <Text style={styles.statusText}>
              {isPrivate ? "PRIVÉE" : "PUBLIQUE"}
            </Text>
          </View>

          <Text style={styles.title} numberOfLines={1}>
            {wishlistTitle}
          </Text>

          <View style={styles.footerLine} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: THEME.surface,
    borderRadius: 16,
    marginBottom: 24,
    // Ombre diffuse
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },

  /* --- FRAME --- */
  frame: {
    height: IMAGE_HEIGHT,
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    backgroundColor: THEME.placeholder,
  },
  gridContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#FFFFFF", // Couleur des "gaps"
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.placeholder,
  },

  /* Utils Grid */
  row: { flexDirection: "row" },
  flex1: { flex: 1, height: "100%" },
  flex2: { flex: 2, height: "100%" },
  imgFull: { width: "100%", height: "100%" },

  /* --- BADGE COMPTEUR --- */
  countBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "#111827", // Noir
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  countText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  /* --- META INFO --- */
  metaInfo: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 16,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "700",
    color: THEME.textSecondary,
    letterSpacing: 1, // Espacement luxe
    textTransform: "uppercase",
  },
  title: {
    fontSize: 17,
    fontWeight: "500",
    color: THEME.textMain,
    lineHeight: 22,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif", // Serif
    marginBottom: 12,
  },

  /* Ligne décorative subtile en bas */
  footerLine: {
    width: 20,
    height: 2,
    backgroundColor: "#E5E7EB",
  },
});
