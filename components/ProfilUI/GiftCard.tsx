import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";

import { WishlistPhotoSummary } from "@/lib/getWishlistPhotos";
import { WishlistVisibility } from "@/types/gift";
import Icon from "../themed-icon";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 80) / 2;
const IMAGE_HEIGHT = 180;

// --- SOUS-COMPOSANT : GRILLE "MOSAÏQUE" ---
const ImageGrid = ({
  images,
  coverUrl,
}: {
  images?: string[];
  coverUrl?: string;
}) => {
  const theme = useAppTheme();
  const count = images?.length ?? 0;
  const GAP = 1;
  const borderColor = theme.border;

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
        <Icon name="images-outline" color={borderColor} />
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

  const theme = useAppTheme();

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
        <View style={[styles.imageFrame, { borderColor: theme.border }]}>
          <ImageGrid images={images?.slice(0, 3)} coverUrl={coverUrl} />

          {/* Badge de décompte style "Numéro d'inventaire" */}
          <View
            style={[
              styles.countBadge,
              { borderColor: theme.border, backgroundColor: theme.surface },
            ]}
          >
            <ThemedText type="label" style={styles.countText}>
              {totalGifts.toString().padStart(2, "0")}
            </ThemedText>
          </View>
        </View>

        {/* CONTENU ÉDITORIAL */}
        <View style={styles.infoContent}>
          <View style={styles.metaRow}>
            <ThemedText type="label" style={{ color: theme.accent }}>
              {getVisibilityLabel()}
            </ThemedText>
            <View style={[styles.dot, { backgroundColor: theme.border }]} />
            <ThemedText type="label" style={{ color: theme.textSecondary }}>
              COLLECTION
            </ThemedText>
          </View>

          <ThemedText type="title" style={styles.title} numberOfLines={1}>
            {wishlistTitle}
          </ThemedText>

          {/* Ligne de signature Or brossé */}
          <View
            style={[styles.accentLine, { backgroundColor: theme.accent }]}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: "transparent",
    marginBottom: 10,
  },
  imageFrame: {
    height: IMAGE_HEIGHT,
    width: "100%",
    borderRadius: 0,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#F2F2F7",
    borderWidth: 1,
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

  countBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 0.5,
  },
  countText: {
    fontSize: 9,
    letterSpacing: 1,
  },
  infoContent: {
    paddingTop: 15,
    paddingHorizontal: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    marginHorizontal: 8,
  },
  title: {
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  accentLine: {
    width: 25,
    height: 1,
    marginTop: 12,
    opacity: 0.4,
  },
});
