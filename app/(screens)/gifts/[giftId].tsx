import ParallaxScrollView from "@/components/parallax-scroll-view";
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
  TouchableOpacity,
  View,
  ViewStyle,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { shareGift } from "@/lib/share";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";

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
  const theme = useAppTheme();
  const { data: session } = authClient.useSession();

  const [giftData, setGiftData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadGift = useCallback(async () => {
    try {
      const res = await giftService.getGiftById(giftId as string);
      if (res.success && "gift" in res) {
        setGiftData(res.gift);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.textMain} />
      </View>
    );
  }

  if (!gift || !group) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: theme.background }]}
      >
        <ThemedIcon name="gift-outline" size={48} colorName="border" />
        <ThemedText
          type="label"
          colorName="textSecondary"
          style={styles.errorText}
        >
          OBJET INTROUVABLE
        </ThemedText>
        <ThemedText
          type="default"
          colorName="textSecondary"
          style={styles.errorSubText}
        >
          Ce cadeau a peut-être été supprimé ou n&apos;est plus disponible.
        </ThemedText>
        <TouchableOpacity
          style={[styles.homeBtn, { backgroundColor: theme.textMain }]}
          onPress={() => router.replace("/(tabs)")}
        >
          <ThemedText
            type="label"
            style={[styles.homeBtnText, { color: theme.background }]}
          >
            RETOUR À L&apos;ACCUEIL
          </ThemedText>
        </TouchableOpacity>
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
    color: theme.textMain,
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
      color: theme.textSecondary,
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
      color: theme.success,
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
      color: theme.danger, // On remplace warning par danger pour cohérence brique
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
        <View
          style={[styles.placeholderImage, { backgroundColor: theme.surface }]}
        >
          <ThemedIcon name="gift-outline" size={64} colorName="border" />
        </View>
      )}

      {/* Overlay dégradé pour fusionner avec le contenu */}
      <View
        style={[
          styles.gradientOverlay,
          { borderBottomColor: theme.background },
        ]}
      />

      {/* Navbar Minimaliste */}
      <View style={[styles.navbar, { top: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ThemedIcon name="arrow-back" size={24} colorName="background" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => shareGift(giftId as string, gift.title)}
          activeOpacity={0.7}
        >
          <ThemedIcon
            name="share-social-outline"
            size={24}
            colorName="background"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ParallaxScrollView
        headerBackgroundColor={{
          light: theme.background,
          dark: theme.background,
        }}
        headerImage={renderHeader()}
        parallaxHeaderHeight={SCREEN_HEIGHT * 0.55}
      >
        <View
          style={[
            styles.contentContainer,
            { backgroundColor: theme.background },
          ]}
        >
          {/* ÉTIQUETTE PRIX "REGISTRE" */}
          {gift.estimatedPrice && (
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 300 }}
              style={[
                styles.priceTag,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <ThemedText type="subtitle" style={styles.priceValue}>
                {gift.estimatedPrice}€
              </ThemedText>
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
              <ThemedText
                type="label"
                style={[styles.statusText, { color: statusConfig.color }]}
              >
                {statusConfig.label}
              </ThemedText>
            </View>

            <ThemedText type="hero" style={styles.title}>
              {gift.title}
            </ThemedText>

            {/* INFO RÉSERVEUR */}
            {(isReserved || isPurchased) &&
              (gift.reservedBy || gift.purchasedBy) && (
                <View
                  style={[
                    styles.attributionBox,
                    {
                      borderLeftColor: theme.accent,
                      backgroundColor: `rgba(${theme.accent.replace(/[^0-9,]/g, "")}, 0.05)`,
                    },
                  ]}
                >
                  <Image
                    source={{
                      uri: isPurchased
                        ? gift.purchasedBy?.image
                        : gift.reservedBy?.image,
                    }}
                    style={[
                      styles.attrAvatar,
                      { backgroundColor: theme.border },
                    ]}
                  />
                  <ThemedText type="default" style={styles.attrText}>
                    {isPurchased ? "Offert par " : "Réservé par "}
                    <ThemedText
                      type="defaultBold"
                      style={{ color: theme.accent }}
                    >
                      {isPurchased
                        ? gift.purchasedBy?.id === session?.user?.id
                          ? "VOUS"
                          : gift.purchasedBy?.name
                        : gift.reservedBy?.id === session?.user?.id
                          ? "VOUS"
                          : gift.reservedBy?.name}
                    </ThemedText>
                  </ThemedText>
                </View>
              )}

            {gift.productUrl && (
              <TouchableOpacity
                onPress={() => openLink(gift.productUrl)}
                style={styles.linkRow}
              >
                <ThemedText type="label" style={styles.linkText}>
                  CONSULTER LA BOUTIQUE
                </ThemedText>
                <ThemedIcon
                  name="arrow-forward"
                  size={12}
                  colorName="textMain"
                />
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.hairline, { backgroundColor: theme.border }]} />

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
              <ThemedText
                type="label"
                colorName="textSecondary"
                style={styles.collectionLabel}
              >
                COLLECTION
              </ThemedText>
              <ThemedText type="subtitle" style={styles.collectionTitle}>
                {group.title}
              </ThemedText>
            </View>
            <ThemedIcon
              name="chevron-forward"
              size={20}
              colorName="textSecondary"
            />
          </TouchableOpacity>

          <View style={[styles.hairline, { backgroundColor: theme.border }]} />

          {/* DESCRIPTION */}
          <View style={styles.descriptionSection}>
            <ThemedText
              type="label"
              colorName="textSecondary"
              style={styles.collectionLabel}
            >
              NOTES
            </ThemedText>
            <ThemedText type="default" style={styles.descriptionText}>
              {gift.description || "Aucune précision particulière."}
            </ThemedText>
          </View>

          <View style={{ height: 120 }} />
        </View>
      </ParallaxScrollView>

      {/* BOTTOM BAR */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: insets.bottom > 0 ? insets.bottom + 10 : 25,
            backgroundColor:
              theme.background === "#FFFFFF"
                ? "rgba(255, 255, 255, 0.95)"
                : "rgba(253, 251, 247, 0.95)", // Adapté à Bone Silk
            borderTopColor: theme.border,
          },
        ]}
      >
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: theme.border }]}
            onPress={() => router.back()}
          >
            <ThemedText type="label" style={styles.secondaryBtnText}>
              RETOUR
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              statusConfig.buttonStyle,
              { flex: 2 },
              statusConfig.buttonStyle === styles.primaryBtn && {
                backgroundColor: theme.textMain,
              },
              statusConfig.buttonStyle === styles.successBtn && {
                backgroundColor: theme.success,
              },
              statusConfig.buttonStyle === styles.secondaryBtn && {
                borderColor: theme.textMain,
                borderWidth: 1,
              },
              statusConfig.buttonStyle === styles.disabledBtn && {
                backgroundColor: theme.border,
              },
            ]}
            activeOpacity={statusConfig.isButtonDisabled ? 1 : 0.9}
            disabled={statusConfig.isButtonDisabled}
            onPress={() => statusConfig.action?.()}
          >
            <ThemedText
              type="label"
              style={[
                styles.primaryBtnText,
                { color: theme.background },
                statusConfig.buttonStyle === styles.secondaryBtn && {
                  color: theme.textMain,
                },
              ]}
            >
              {statusConfig.buttonText}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    marginTop: 15,
  },
  errorSubText: {
    marginTop: 10,
    marginBottom: 30,
    textAlign: "center",
    maxWidth: "70%",
  },
  homeBtn: {
    paddingHorizontal: 25,
    paddingVertical: 15,
  },
  homeBtnText: {
    letterSpacing: 1.5,
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
  },

  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: "transparent",
    borderBottomWidth: 150,
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
    marginTop: -40,
    paddingHorizontal: 32,
  },

  priceTag: {
    alignSelf: "flex-end",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    marginTop: -25,
    marginRight: -10,
    transform: [{ rotate: "2deg" }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  priceValue: { fontWeight: "700" },

  headerSection: { marginTop: 20, marginBottom: 30 },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 15,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { letterSpacing: 1.5 },

  title: {
    marginBottom: 20,
  },

  attributionBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderLeftWidth: 2,
    marginBottom: 20,
  },
  attrAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  attrText: { fontSize: 12 },

  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  linkText: {
    letterSpacing: 1,
    textDecorationLine: "underline",
  },

  hairline: { height: 1, marginVertical: 25 },

  collectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  collectionLabel: {
    letterSpacing: 1.5,
    marginBottom: 5,
  },
  collectionTitle: {},

  descriptionSection: { marginBottom: 30 },
  descriptionText: {
    marginTop: 10,
  },

  /* BOTTOM BAR */
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingTop: 20,
    paddingHorizontal: 32,
  },
  actionRow: { flexDirection: "row", gap: 15 },

  secondaryBtn: {
    flex: 1,
    height: 60,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    letterSpacing: 1,
  },

  primaryBtn: {
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  successBtn: {
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledBtn: {
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryBtnText: {
    letterSpacing: 1.5,
  },
});
