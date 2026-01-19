import ParallaxScrollView from "@/components/parallax-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import { giftService } from "@/lib/services/gift-service";
import { authClient } from "@/lib/auth/auth-client";
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

// --- THEME LUXE ---
const THEME = {
  background: "#FDFBF7",
  surface: "#FFFFFF",
  textMain: "#111827",
  textSecondary: "#6B7280",
  border: "rgba(0,0,0,0.06)",
  accent: "#111827",
  success: "#10B981", // Vert Émeraude
  warning: "#D97706", // Ambre
  disabled: "#E5E7EB",
};

const SCREEN_HEIGHT = Dimensions.get("window").height;

const openLink = async (url?: string) => {
  if (url) {
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
  }
};

export default function GiftDetailView() {
  const { giftId } = useLocalSearchParams<{ giftId: string }>();
  const insets = useSafeAreaInsets();

  const [giftData, setGiftData] = useState<any>(null);

  const loadGift = useCallback(async () => {
    const res = await giftService.getGiftById(giftId as string);
    if (res.success && "gift" in res) {
      setGiftData(res.gift);
    }
  }, [giftId]);

  useEffect(() => {
    loadGift();
  }, [loadGift]);

  const gift = giftData; // Temporaire
  const group = giftData?.wishlist;

  if (!gift || !group) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Objet introuvable.</Text>
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

  // Configuration dynamique selon l'état
  let statusConfig: {
    label: string;
    color: string;
    priceColor: string;
    buttonText: string;
    buttonIcon: keyof typeof Ionicons.glyphMap;
    isButtonDisabled: boolean;
    buttonStyle: ViewStyle;
  } = {
    label: "DISPONIBLE",
    color: THEME.textMain,
    priceColor: THEME.textMain,
    buttonText: "Réserver ce cadeau",
    buttonIcon: "bag-handle-outline" as keyof typeof Ionicons.glyphMap,
    isButtonDisabled: false,
    buttonStyle: styles.primaryBtn,
  };

  if (isPurchased) {
    statusConfig = {
      label: "DÉJÀ OFFERT",
      color: THEME.success,
      priceColor: THEME.success,
      buttonText: "Cadeau déjà offert",
      buttonIcon: "gift-outline",
      isButtonDisabled: true,
      buttonStyle: styles.successBtn,
    };
  } else if (isReserved) {
    statusConfig = {
      label: "RÉSERVÉ",
      color: THEME.warning,
      priceColor: THEME.warning,
      buttonText: "Actuellement réservé",
      buttonIcon: "time-outline",
      isButtonDisabled: true,
      buttonStyle: styles.warningBtn,
    };
  }

  // --- HEADER PARALLAX ---
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
          transition={500}
        />
      ) : (
        <View style={styles.placeholderImage}>
          <Ionicons name="gift-outline" size={64} color="#D1D5DB" />
        </View>
      )}

      <View style={styles.darkOverlay} />

      {/* Navbar */}
      <View style={[styles.navbar, { top: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.navButtonBlur}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButtonBlur}>
          <Ionicons name="share-outline" size={20} color="#FFF" />
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
        parallaxHeaderHeight={SCREEN_HEIGHT * 0.5}
      >
        <View style={styles.contentContainer}>
          {/* STICKER PRIX (Couleur dynamique) */}
          {gift.estimatedPrice && (
            <View
              style={[
                styles.priceSticker,
                { borderColor: statusConfig.priceColor },
              ]}
            >
              <Text
                style={[styles.priceValue, { color: statusConfig.priceColor }]}
              >
                {gift.estimatedPrice}€
              </Text>
            </View>
          )}

          {/* SECTION TITRE */}
          <View style={styles.headerSection}>
            {/* BADGE STATUT */}
            <View style={styles.categoryRow}>
              <View
                style={[
                  styles.categoryDot,
                  { backgroundColor: statusConfig.color },
                ]}
              />
              <Text
                style={[styles.categoryText, { color: statusConfig.color }]}
              >
                {statusConfig.label}
              </Text>
            </View>

            <Text style={styles.title}>{gift.title}</Text>

            {gift.productUrl && (
              <TouchableOpacity
                onPress={() => openLink(gift.productUrl)}
                style={styles.linkRow}
              >
                <Text style={styles.linkText}>Visiter la boutique</Text>
                <Ionicons
                  name="arrow-forward"
                  size={14}
                  color={THEME.textMain}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* CARTE ÉVÉNEMENT */}
          <TouchableOpacity
            style={styles.eventCard}
            onPress={() =>
              router.push({
                pathname: "/gifts/wishlists/[wishlistId]",
                params: { wishlistId: group.id },
              })
            }
          >
            <View style={styles.eventLeft}>
              <Text style={styles.eventLabel}>COLLECTION</Text>
              <Text style={styles.eventTitle} numberOfLines={1}>
                {group.title}
              </Text>
              <View style={styles.eventDateRow}>
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={THEME.textSecondary}
                />
                <Text style={styles.eventDate}>
                  {group.eventDate
                    ? new Date(group.eventDate).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Date non définie"}
                </Text>
              </View>
            </View>
            <View style={styles.eventRight}>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={THEME.textSecondary}
              />
            </View>
          </TouchableOpacity>

          {/* DESCRIPTION */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Détails</Text>
            <Text style={styles.descriptionText}>
              {gift.description ||
                "Aucune note particulière pour cet objet. Laissez-vous guider par l'inspiration."}
            </Text>
          </View>

          <View style={{ height: 140 }} />
        </View>
      </ParallaxScrollView>

      {/* BOTTOM BAR */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 },
        ]}
      >
        <View style={styles.actionRow}>
          {/* Bouton Secondaire : Retour/Ignorer ou Voir Liste */}
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryBtnText}>Retour</Text>
          </TouchableOpacity>

          {/* Bouton Principal : État Dynamique */}
          <TouchableOpacity
            style={[statusConfig.buttonStyle, { flex: 2 }]} // flex 2 pour largeur
            activeOpacity={statusConfig.isButtonDisabled ? 1 : 0.9}
            disabled={statusConfig.isButtonDisabled}
            onPress={async () => {
              if (!isReserved && !isPurchased) {
                const res = await giftService.reserveGift(giftId);
                if (res.success) loadGift();
              }
            }}
          >
            <Text
              style={[
                styles.primaryBtnText,
                (isReserved || isPurchased) && { color: "#FFF" }, // Texte blanc pour boutons colorés
              ]}
            >
              {statusConfig.buttonText}
            </Text>
            <Ionicons name={statusConfig.buttonIcon} size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: THEME.background,
  },
  errorText: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 18,
    color: THEME.textSecondary,
  },

  /* HEADER */
  imageContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E5E7EB",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageDimmed: {
    opacity: 0.8, // Assombrit un peu si indisponible
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  navbar: {
    position: "absolute",
    left: 24,
    right: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },
  navButtonBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(12px)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  /* CONTENT SHEET */
  contentContainer: {
    flex: 1,
    backgroundColor: THEME.background,
    marginTop: -50,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 40,
    minHeight: SCREEN_HEIGHT * 0.6,
  },

  /* PRICE STICKER */
  priceSticker: {
    position: "absolute",
    top: -30,
    right: 30,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 2, // Bordure un peu plus visible pour la couleur de statut
    transform: [{ rotate: "3deg" }],
  },
  priceValue: {
    fontSize: 24,
    fontWeight: "700",
  },

  /* HEADER INFO */
  headerSection: {
    marginBottom: 32,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 34,
    fontWeight: "400",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    lineHeight: 40,
    marginBottom: 16,
    marginRight: 20,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: THEME.textMain,
    paddingBottom: 2,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.textMain,
  },

  /* EVENT CARD */
  eventCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
  },
  eventLeft: {
    flex: 1,
  },
  eventLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.textMain,
    marginBottom: 6,
  },
  eventDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  eventDate: {
    fontSize: 14,
    color: THEME.textSecondary,
  },
  eventRight: {
    paddingLeft: 10,
  },

  /* DESCRIPTION */
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 28,
    color: "#4B5563",
    fontWeight: "400",
  },

  /* BOTTOM BAR */
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(253, 251, 247, 0.9)",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    paddingTop: 16,
    paddingHorizontal: 24,
    backdropFilter: "blur(20px)",
  },
  actionRow: {
    flexDirection: "row",
    gap: 16,
    height: 56,
  },

  /* STYLES BOUTONS */
  secondaryBtn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.textMain,
  },

  // Style commun boutons principaux
  primaryBtn: {
    // Disponible
    backgroundColor: THEME.textMain,
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  warningBtn: {
    // Réservé
    backgroundColor: THEME.warning,
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    opacity: 0.9,
  },
  successBtn: {
    // Acheté
    backgroundColor: THEME.success,
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    opacity: 0.9,
  },

  primaryBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFF",
  },
});
