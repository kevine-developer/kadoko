import ParallaxScrollView from "@/components/parallax-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import { giftService } from "@/lib/services/gift-service";
import { authClient } from "@/features/auth";
import { socketService } from "@/lib/services/socket";
import { Gift } from "@/types/gift";
import {
  Dimensions,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";

// --- THEME ÉDITORIAL ---
const THEME = {
  background: "#FDFBF7", // Bone Silk
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.08)",
  success: "#4A6741",
  warning: "#C34A4A", // Rouge brique pour "réservé"
};

const SCREEN_HEIGHT = Dimensions.get("window").height;

const openLink = async (url?: string) => {
  if (url) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
  }
};

export default function GiftDetailView() {
  const { giftId } = useLocalSearchParams<{ giftId: string }>();
  const insets = useSafeAreaInsets();
  const { data: session } = authClient.useSession();

  const [giftData, setGiftData] = useState<any>(null);

  const loadGift = useCallback(async () => {
    const res = await giftService.getGiftById(giftId as string);
    if (res.success && "gift" in res) {
      setGiftData(res.gift);
    }
  }, [giftId]);

  useEffect(() => {
    loadGift();
    const handleGiftUpdate = (updatedGift: Gift) => {
      if (updatedGift.id === giftId) setGiftData(updatedGift);
    };
    socketService.connect();
    socketService.on("gift:updated", handleGiftUpdate);
    return () => socketService.off("gift:updated", handleGiftUpdate);
  }, [loadGift, giftId]);

  const gift = giftData;
  const group = giftData?.wishlist;
  const isOwner = group?.userId === session?.user?.id;

  if (!gift || !group) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>OBJET INTROUVABLE</Text>
      </View>
    );
  }

  // --- LOGIQUE D'ÉTAT ---
  const isPurchased =
    gift.status === "PURCHASED" || (gift.purchase && !!gift.purchase.userId);
  const isReserved =
    !isPurchased &&
    (gift.status === "RESERVED" ||
      (gift.reservation && !!gift.reservation.userId));
  const isDraft = !gift.isPublished;

  let statusConfig: {
    label: string;
    color: string;
    buttonText: string;
    isButtonDisabled: boolean;
    buttonStyle: ViewStyle;
    action?: () => void;
  } = {
    label: "DISPONIBLE",
    color: THEME.textMain,
    buttonText: "RÉSERVER CETTE PIÈCE",
    isButtonDisabled: false,
    buttonStyle: styles.primaryBtn,
    action: async () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const res = await giftService.reserveGift(giftId);
      if (res.success) loadGift();
    },
  };

  if (isDraft) {
    statusConfig = {
      label: "NON PUBLIÉ",
      color: THEME.textSecondary,
      buttonText: isOwner ? "PUBLIER MAINTENANT" : "INDISPONIBLE",
      isButtonDisabled: !isOwner,
      buttonStyle: isOwner ? styles.primaryBtn : styles.disabledBtn,
      action: isOwner
        ? async () => {
            const res = await giftService.publishGift(giftId);
            if (res.success) loadGift();
          }
        : undefined,
    };
  } else if (isPurchased) {
    statusConfig = {
      label: "ACQUIS",
      color: THEME.success,
      buttonText: isOwner ? "CONFIRMER RÉCEPTION" : "DÉJÀ OFFERT",
      isButtonDisabled: !isOwner,
      buttonStyle: isOwner ? styles.successBtn : styles.disabledBtn,
      action: isOwner
        ? async () => {
            const res = await giftService.confirmReceipt(giftId as string);
            if (res.success) loadGift();
          }
        : undefined,
    };
  } else if (isReserved) {
    const isReserver = gift.reservedById === session?.user?.id;
    statusConfig = {
      label: "RÉSERVÉ",
      color: THEME.warning,
      buttonText: isReserver
        ? "ANNULER MA RÉSERVATION"
        : "ACTUELLEMENT RÉSERVÉ",
      isButtonDisabled: !isReserver,
      buttonStyle: isReserver ? styles.secondaryBtn : styles.disabledBtn,
      action: isReserver
        ? async () => {
            const res = await giftService.releaseGift(giftId);
            if (res.success) loadGift();
          }
        : undefined,
    };
  } else if (isOwner) {
    statusConfig = {
      ...statusConfig,
      label: "EN LIGNE",
      buttonText: "RETIRER DU FIL",
      buttonStyle: styles.secondaryBtn,
      action: async () => {
        const res = await giftService.unpublishGift(giftId);
        if (res.success) loadGift();
      },
    };
  }

  const renderHeader = () => (
    <View style={styles.imageContainer}>
      {gift.imageUrl ? (
        <Image
          source={{ uri: gift.imageUrl }}
          style={[
            styles.image,
            (isReserved || isPurchased) && styles.imageDimmed,
          ]}
          contentFit="cover"
          transition={800}
        />
      ) : (
        <View style={styles.placeholderImage}>
          <Ionicons name="gift-outline" size={64} color={THEME.border} />
        </View>
      )}

      {/* Overlay dégradé pour fusionner avec le contenu */}
      <View style={styles.gradientOverlay} />

      {/* Navbar Minimaliste */}
      <View style={[styles.navbar, { top: insets.top + 10 }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => {}}>
          <Ionicons name="share-social-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ParallaxScrollView
        headerBackgroundColor={{
          light: THEME.background,
          dark: THEME.background,
        }}
        headerImage={renderHeader()}
        parallaxHeaderHeight={SCREEN_HEIGHT * 0.55}
      >
        <View style={styles.contentContainer}>
          {/* ÉTIQUETTE PRIX "REGISTRE" */}
          {gift.estimatedPrice && (
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 300 }}
              style={styles.priceTag}
            >
              <Text style={styles.priceValue}>{gift.estimatedPrice}€</Text>
            </MotiView>
          )}

          {/* HEADER INFO */}
          <View style={styles.headerSection}>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: statusConfig.color },
                ]}
              />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>

            <Text style={styles.title}>{gift.title}</Text>

            {/* INFO RÉSERVEUR */}
            {(isReserved || isPurchased) &&
              (gift.reservedBy || gift.purchasedBy) && (
                <View style={styles.attributionBox}>
                  <Image
                    source={{
                      uri: isPurchased
                        ? gift.purchasedBy?.image
                        : gift.reservedBy?.image,
                    }}
                    style={styles.attrAvatar}
                  />
                  <Text style={styles.attrText}>
                    {isPurchased ? "Offert par " : "Réservé par "}
                    <Text style={styles.attrName}>
                      {isPurchased
                        ? gift.purchasedBy?.id === session?.user?.id
                          ? "VOUS"
                          : gift.purchasedBy?.name
                        : gift.reservedBy?.id === session?.user?.id
                          ? "VOUS"
                          : gift.reservedBy?.name}
                    </Text>
                  </Text>
                </View>
              )}

            {gift.productUrl && (
              <TouchableOpacity
                onPress={() => openLink(gift.productUrl)}
                style={styles.linkRow}
              >
                <Text style={styles.linkText}>CONSULTER LA BOUTIQUE</Text>
                <Ionicons
                  name="arrow-forward"
                  size={12}
                  color={THEME.textMain}
                />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.hairline} />

          {/* CARTE COLLECTION */}
          <TouchableOpacity
            style={styles.collectionRow}
            onPress={() =>
              router.push({
                pathname: "/gifts/wishlists/[wishlistId]",
                params: { wishlistId: group.id },
              })
            }
          >
            <View>
              <Text style={styles.collectionLabel}>COLLECTION</Text>
              <Text style={styles.collectionTitle}>{group.title}</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={THEME.textSecondary}
            />
          </TouchableOpacity>

          <View style={styles.hairline} />

          {/* DESCRIPTION */}
          <View style={styles.descriptionSection}>
            <Text style={styles.collectionLabel}>NOTES</Text>
            <Text style={styles.descriptionText}>
              {gift.description || "Aucune précision particulière."}
            </Text>
          </View>

          <View style={{ height: 120 }} />
        </View>
      </ParallaxScrollView>

      {/* BOTTOM BAR */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom > 0 ? insets.bottom + 10 : 25 },
        ]}
      >
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryBtnText}>RETOUR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[statusConfig.buttonStyle, { flex: 2 }]}
            activeOpacity={statusConfig.isButtonDisabled ? 1 : 0.9}
            disabled={statusConfig.isButtonDisabled}
            onPress={() => statusConfig.action?.()}
          >
            <Text
              style={[
                styles.primaryBtnText,
                statusConfig.buttonStyle === styles.secondaryBtn && {
                  color: THEME.textMain,
                },
              ]}
            >
              {statusConfig.buttonText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: THEME.background,
  },
  errorText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    color: THEME.textSecondary,
  },

  /* HEADER IMAGE */
  imageContainer: { width: "100%", height: "100%", backgroundColor: "#1A1A1A" },
  image: { width: "100%", height: "100%" },
  imageDimmed: { opacity: 0.6 },
  placeholderImage: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F2F7",
  },

  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: "transparent",
    borderBottomWidth: 150,
    borderBottomColor: THEME.background,
    opacity: 1,
  },

  navbar: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* CONTENT */
  contentContainer: {
    flex: 1,
    backgroundColor: THEME.background,
    marginTop: -40,
    paddingHorizontal: 32,
  },

  priceTag: {
    alignSelf: "flex-end",
    backgroundColor: THEME.surface,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: THEME.border,
    marginTop: -25,
    marginRight: -10,
    transform: [{ rotate: "2deg" }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  priceValue: { fontSize: 18, fontWeight: "700", color: THEME.textMain },

  headerSection: { marginTop: 20, marginBottom: 30 },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 15,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },

  title: {
    fontSize: 36,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    lineHeight: 42,
    letterSpacing: -1,
    marginBottom: 20,
  },

  attributionBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(175, 144, 98, 0.05)",
    padding: 12,
    borderLeftWidth: 2,
    borderLeftColor: THEME.accent,
    marginBottom: 20,
  },
  attrAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: THEME.border,
  },
  attrText: { fontSize: 12, color: THEME.textMain },
  attrName: { fontWeight: "800", color: THEME.accent },

  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  linkText: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.textMain,
    letterSpacing: 1,
    textDecorationLine: "underline",
  },

  hairline: { height: 1, backgroundColor: THEME.border, marginVertical: 25 },

  collectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  collectionLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 5,
  },
  collectionTitle: {
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
  },

  descriptionSection: { marginBottom: 30 },
  descriptionText: {
    fontSize: 16,
    lineHeight: 26,
    color: THEME.textMain,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginTop: 10,
  },

  /* BOTTOM BAR */
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(253, 251, 247, 0.95)",
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    paddingTop: 20,
    paddingHorizontal: 32,
  },
  actionRow: { flexDirection: "row", gap: 15 },

  secondaryBtn: {
    flex: 1,
    height: 60,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.textMain,
    letterSpacing: 1,
  },

  primaryBtn: {
    backgroundColor: THEME.textMain,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  successBtn: {
    backgroundColor: THEME.success,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledBtn: {
    backgroundColor: THEME.border,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 1.5,
  },
});
