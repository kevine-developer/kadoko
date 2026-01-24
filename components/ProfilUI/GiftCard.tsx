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
import * as Haptics from "expo-haptics";

import { WishlistPhotoSummary } from "@/lib/getWishlistPhotos";
import { WishlistVisibility } from "@/types/gift";

// --- THEME ÉDITORIAL COHÉRENT ---
const THEME = {
  background: "#FDFBF7", // Bone Silk
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.08)",
};

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 80) / 2; // Ajusté pour les marges éditoriales
const IMAGE_HEIGHT = 180;

// --- SOUS-COMPOSANT : GRILLE "MOSAÏQUE" ---
const ImageGrid = ({
  images,
  coverUrl,
}: {
  images?: string[];
  coverUrl?: string;
}) => {
  const count = images?.length ?? 0;
  const GAP = 1; // Hairline gap pour le luxe

  if (count === 0) {
    if (coverUrl) {
      return (
        <Image
          source={{ uri: coverUrl }}
          style={styles.imgFull}
          contentFit="cover"
          transition={500}
        />
      );
    }
    return (
      <View style={[styles.gridContainer, styles.placeholder]}>
        <Ionicons name="images-outline" size={20} color={THEME.border} />
      </View>
    );
  }

  const RenderImage = ({ uri, style }: { uri: string; style: any }) => (
    <Image source={{ uri }} style={style} contentFit="cover" transition={500} />
  );

  if (count === 1) {
    return <RenderImage uri={images![0]} style={styles.imgFull} />;
  }

  if (count === 2) {
    return (
      <View style={[styles.gridContainer, { flexDirection: "row", gap: GAP }]}>
        <RenderImage uri={images![0]} style={styles.flex1} />
        <RenderImage uri={images![1]} style={styles.flex1} />
      </View>
    );
  }

  // 3+ Images style Galerie
  return (
    <View style={[styles.gridContainer, { flexDirection: "row", gap: GAP }]}>
      <RenderImage uri={images![0]} style={styles.flex1} />
      <View style={[styles.flex1, { gap: GAP }]}>
        <RenderImage uri={images![1]} style={styles.flex1} />
        <RenderImage uri={images![2] || images![0]} style={styles.flex1} />
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
  coverUrl,
}: WishlistPhotoSummary & { coverUrl?: string }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const navigateToGiftGroup = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/gifts/wishlists/[wishlistId]",
      params: { wishlistId: wishlistId },
    });
  };

  const getVisibilityLabel = () => {
    switch (wishlistVisibility) {
      case WishlistVisibility.PRIVATE:
        return "PRIVÉ";
      case WishlistVisibility.FRIENDS:
        return "CERCLE";
      default:
        return "PUBLIC";
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={1}
        onPress={navigateToGiftGroup}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {/* CADRE IMAGE "GALERIE" */}
        <View style={styles.imageFrame}>
          <ImageGrid images={images?.slice(0, 3)} coverUrl={coverUrl} />

          {/* Badge de décompte style "Numéro d'inventaire" */}
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {totalGifts.toString().padStart(2, "0")}
            </Text>
          </View>
        </View>

        {/* CONTENU ÉDITORIAL */}
        <View style={styles.infoContent}>
          <View style={styles.metaRow}>
            <Text style={styles.visibilityLabel}>{getVisibilityLabel()}</Text>
            <View style={styles.dot} />
            <Text style={styles.collectionLabel}>COLLECTION</Text>
          </View>

          <Text style={styles.title} numberOfLines={1}>
            {wishlistTitle}
          </Text>

          {/* Ligne de signature Or brossé */}
          <View style={styles.accentLine} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: "transparent", // Pas de fond pour laisser respirer le Bone Silk
    marginBottom: 10,
  },

  /* IMAGE FRAME */
  imageFrame: {
    height: IMAGE_HEIGHT,
    width: "100%",
    borderRadius: 0, // Rectangulaire luxe
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#F2F2F7",
    borderWidth: 1,
    borderColor: THEME.border,
  },
  gridContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  flex1: { flex: 1, height: "100%" },
  imgFull: { width: "100%", height: "100%" },

  /* BADGE INVENTAIRE */
  countBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 0.5,
    borderColor: THEME.border,
  },
  countText: {
    color: THEME.textMain,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },

  /* INFO CONTENT */
  infoContent: {
    paddingTop: 15,
    paddingHorizontal: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  visibilityLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: THEME.accent, // Or brossé
    letterSpacing: 1.2,
  },
  collectionLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1.2,
  },
  dot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: THEME.border,
    marginHorizontal: 8,
  },
  title: {
    fontSize: 18,
    color: THEME.textMain,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif", // Serif pour le prestige
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  accentLine: {
    width: 25,
    height: 1,
    backgroundColor: THEME.accent,
    marginTop: 12,
    opacity: 0.4,
  },
});
