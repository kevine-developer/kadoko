import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useRef } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import * as Haptics from "expo-haptics";
import { shareGift } from "@/lib/share";

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

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await shareGift(item.id, item.product.name);
  };

  const handleMainAction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/(screens)/gifts/[giftId]",
      params: { giftId: item.id },
    });
  };

  const getHostname = (url: string) => {
    try {
      if (!url) return "";
      const hostname = url
        .replace(/^(?:https?:\/\/)?(?:www\.)?/i, "")
        .split("/")[0];
      return hostname.charAt(0).toUpperCase() + hostname.slice(1);
    } catch {
      return "Boutique en ligne";
    }
  };

  const isPurchased = item.isPurchased;
  const isReserved = item.isReserved;
  const isTaken = isReserved || isPurchased;
  const isReservedByMe = item.isMyReservation;

  return (
    <Animated.View
      style={[styles.container, { transform: [{ scale: scaleAnim }] }]}
    >
      {/* 1. HEADER : IDENTITÉ (User & Collection) */}
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
          <View>
            <Text style={styles.userName}>{item.user.name}</Text>
            <Text style={styles.userContext}>{item.context.toUpperCase()}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Ionicons name="share-outline" size={20} color={THEME.textMain} />
        </TouchableOpacity>
      </View>

      {/* 2. MILIEU : IMAGE VITRINE */}
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleMainAction}
        style={styles.imageFrame}
      >
        <Image
          source={{ uri: item.product.image }}
          style={[styles.image, isTaken && styles.imageDimmed]}
          contentFit="cover"
          transition={500}
        />
        {isTaken && (
          <View style={styles.takenOverlay}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {isPurchased ? "ACQUIS" : "RÉSERVÉ"}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* 3. FOOTER : PRODUIT & ACTIONS */}
      <View style={styles.cardFooter}>
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={1}>
            {item.product.name}
          </Text>
          {item.product.url && (
            <View style={styles.sourceRow}>
              <Ionicons name="link-outline" size={12} color={THEME.accent} />
              <Text style={styles.sourceText}>
                {getHostname(item.product.url)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actionRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceValue}>{item.product.price}€</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.mainActionBtn,
              isTaken && !isReservedByMe ? styles.alertBtn : styles.primaryBtn,
            ]}
            onPress={handleMainAction}
          >
            {isTaken && !isReservedByMe ? (
              <>
                <Ionicons
                  name="notifications-outline"
                  size={14}
                  color={THEME.textMain}
                />
                <Text style={styles.alertBtnText}>M&apos;ALERTER</Text>
              </>
            ) : (
              <>
                <Text style={styles.primaryBtnText}>
                  {isReservedByMe ? "MA RÉSERVATION" : "DÉCOUVRIR"}
                </Text>
                <Ionicons name="chevron-forward" size={14} color="#FFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

export default GiftCardHome;

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.background,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 0, // Look architectural
    overflow: "hidden",
  },
  /* HEADER */
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: THEME.surface,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 0,
    backgroundColor: "#F2F2F7",
    borderWidth: 0.5,
    borderColor: THEME.border,
  },
  userName: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.textMain,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  userContext: {
    fontSize: 8,
    fontWeight: "800",
    color: THEME.accent,
    letterSpacing: 1,
  },
  shareBtn: {
    padding: 5,
  },
  /* IMAGE */
  imageFrame: {
    width: "100%",
    height: 200, // Image prédominante au milieu
    backgroundColor: "#F9FAFB",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageDimmed: {
    opacity: 0.7,
  },
  takenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(253, 251, 247, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    backgroundColor: THEME.textMain,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
  },
  /* FOOTER */
  cardFooter: {
    padding: 20,
    backgroundColor: THEME.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  productInfo: {
    marginBottom: 15,
  },
  productTitle: {
    fontSize: 20,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    marginBottom: 4,
  },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sourceText: {
    fontSize: 11,
    color: THEME.textSecondary,
    fontWeight: "600",
    fontStyle: "italic",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 15,
  },
  priceContainer: {
    borderLeftWidth: 2,
    borderLeftColor: THEME.accent,
    paddingLeft: 10,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "800",
    color: THEME.textMain,
  },
  mainActionBtn: {
    flex: 1,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryBtn: {
    backgroundColor: THEME.textMain,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  alertBtn: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: THEME.textMain,
  },
  alertBtnText: {
    color: THEME.textMain,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
});
