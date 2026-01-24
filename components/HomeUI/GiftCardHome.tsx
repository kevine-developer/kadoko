import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState, useRef } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import * as Haptics from "expo-haptics";

// --- THEME ÉDITORIAL COHÉRENT ---
const THEME = {
  background: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.08)",
  surface: "#FDFBF7", // Bone Silk
  success: "#4A6741",
};

const GiftCardHome = ({ item }: { item: any }) => {
  const [liked, setLiked] = useState(false);
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
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const toggleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLiked(!liked);
  };

  const handleMainAction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (item.isReserved || item.isPurchased) {
      router.push({
        pathname: "/(screens)/gifts/wishlists/[wishlistId]",
        params: { wishlistId: item.wishlistId },
      });
    } else {
      router.push({
        pathname: "/(screens)/gifts/[giftId]",
        params: { giftId: item.id },
      });
    }
  };

  const isTaken = item.isReserved || item.isPurchased;

  return (
    <Animated.View
      style={[styles.container, { transform: [{ scale: scaleAnim }] }]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleMainAction}
        style={styles.cardTouch}
      >
        {/* Image (Gauche) */}
        <View style={styles.imageSection}>
          <Image
            source={{ uri: item.product.image }}
            style={[styles.image, isTaken && styles.imageDimmed]}
            contentFit="cover"
            transition={500}
          />
          {isTaken && (
            <View style={styles.takenOverlay}>
              <Text style={styles.takenText}>
                {item.isPurchased ? "ACQUIS" : "RÉSERVÉ"}
              </Text>
            </View>
          )}
        </View>

        {/* Contenu (Droite) */}
        <View style={styles.contentSection}>
          {/* Header Identité */}
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
              <View>
                <Text style={styles.userName} numberOfLines={1}>
                  {item.user.name}
                </Text>
                <Text style={styles.userContext}>
                  {item.context.toUpperCase()}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={toggleLike} style={styles.likeBtn}>
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={16}
                color={liked ? "#C34A4A" : THEME.textMain}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.title} numberOfLines={1}>
            {item.product.name}
          </Text>

          <View style={styles.footerRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>{item.product.price}€</Text>
              <Text style={styles.priceLabel}>ESTIMÉ</Text>
            </View>

            <View style={styles.actionGroup}>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  // Partage
                }}
                style={styles.circleBtn}
              >
                <Ionicons
                  name="share-outline"
                  size={14}
                  color={THEME.textMain}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, isTaken && styles.actionBtnTaken]}
                onPress={handleMainAction}
              >
                <Text
                  style={[
                    styles.actionBtnText,
                    isTaken && styles.actionBtnTextTaken,
                  ]}
                >
                  {isTaken ? "VOIR" : "RÉSERVER"}
                </Text>
                {!isTaken && (
                  <Ionicons name="arrow-forward" size={10} color="#FFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default GiftCardHome;

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.surface,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 0,
  },
  cardTouch: {
    flexDirection: "row",
    height: 160,
  },
  imageSection: {
    width: 110,
    height: "100%",
    backgroundColor: "#F9FAFB",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageDimmed: {
    opacity: 0.6,
  },
  takenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(253, 251, 247, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  takenText: {
    fontSize: 8,
    fontWeight: "900",
    color: THEME.accent,
    letterSpacing: 1.5,
    backgroundColor: THEME.surface,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: THEME.accent,
  },
  contentSection: {
    flex: 1,
    padding: 14,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F2F2F7",
    borderWidth: 0.5,
    borderColor: THEME.border,
  },
  userName: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.textMain,
    maxWidth: 100,
  },
  userContext: {
    fontSize: 8,
    color: THEME.accent,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  likeBtn: {
    padding: 4,
  },
  title: {
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    marginBottom: 4,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    flexDirection: "column",
  },
  priceText: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.textMain,
  },
  priceLabel: {
    fontSize: 7,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1,
  },
  actionGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  circleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    justifyContent: "center",
    alignItems: "center",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.textMain,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  actionBtnTaken: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: THEME.border,
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  actionBtnTextTaken: {
    color: THEME.textMain,
  },
});
