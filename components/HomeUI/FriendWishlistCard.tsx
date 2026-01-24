import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { router } from "expo-router";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";

// --- THEME ÉDITORIAL ---
const THEME = {
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.08)",
};

const FriendWishlistCard = ({ wishlist }: { wishlist: any }) => {
  const owner = wishlist.user;
  const coverImage =
    wishlist.gifts?.[0]?.imageUrl ||
    "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=1000&auto=format&fit=crop";

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/gifts/wishlists/[wishlistId]",
      params: { wishlistId: wishlist.id },
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.cardContainer}
      onPress={handlePress}
    >
      {/* CADRE IMAGE "GALERIE" */}
      <View style={styles.imageFrame}>
        <Image
          source={{ uri: coverImage }}
          style={styles.image}
          contentFit="cover"
          transition={500}
        />

        {/* Date "Étiquette" */}
        {wishlist.eventDate && (
          <View style={styles.dateTag}>
            <Text style={styles.dateText}>
              {new Date(wishlist.eventDate)
                .toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
                .toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* INFO ÉDITORIALE */}
      <View style={styles.infoContent}>
        <Text style={styles.title} numberOfLines={1}>
          {wishlist.title}
        </Text>

        <View style={styles.authorRow}>
          <Image source={{ uri: owner?.image }} style={styles.squareAvatar} />
          <Text style={styles.authorName} numberOfLines={1}>
            {owner?.name}
          </Text>
        </View>

        {/* Petite ligne dorée décorative */}
        <View style={styles.accentLine} />
      </View>
    </TouchableOpacity>
  );
};

export default FriendWishlistCard;

const styles = StyleSheet.create({
  cardContainer: {
    width: 150,
    marginRight: 12,
  },
  /* IMAGE FRAME */
  imageFrame: {
    width: 150,
    height: 200,
    borderRadius: 0, // Rectangulaire luxe
    backgroundColor: "#F2F2F7",
    marginBottom: 12,
    position: "relative",
    borderWidth: 1,
    borderColor: THEME.border,
    // Suppression des ombres portées lourdes
  },
  image: {
    width: "100%",
    height: "100%",
    opacity: 0.9,
  },
  dateTag: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: THEME.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderColor: THEME.border,
  },
  dateText: {
    fontSize: 9,
    fontWeight: "800",
    color: THEME.textMain,
    letterSpacing: 1,
  },

  /* INFO */
  infoContent: {
    paddingHorizontal: 2,
  },
  title: {
    fontSize: 16,
    color: THEME.textMain,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  squareAvatar: {
    width: 18,
    height: 18,
    borderRadius: 0, // Avatar carré
    backgroundColor: "#E5E7EB",
  },
  authorName: {
    fontSize: 10,
    fontWeight: "700",
    color: THEME.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    flex: 1,
  },
  accentLine: {
    width: 20,
    height: 1,
    backgroundColor: THEME.accent,
    opacity: 0.5,
  },
});
