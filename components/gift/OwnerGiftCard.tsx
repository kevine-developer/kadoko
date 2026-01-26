import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { memo } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";

import { Gift } from "@/types/gift";

// --- THEME ÉDITORIAL COHÉRENT ---
const THEME = {
  background: "#FDFBF7", // Bone Silk
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.08)",
  success: "#4A6741", // Vert forêt luxe
  error: "#C34A4A",
};

type OwnerGiftCardProps = {
  gift: Gift;
  onPress: (gift: Gift) => void;
  onRemove?: (gift: Gift) => void;
};

function OwnerGiftCard({ gift, onPress, onRemove }: OwnerGiftCardProps) {
  // Logique des statuts étendue
  const isReceived = gift.status === "RECEIVED";
  const isPurchased =
    (gift.status === "PURCHASED" ||
      (gift.purchase && !!gift.purchase.userId)) &&
    !isReceived;
  const isReserved =
    (gift.status === "RESERVED" ||
      (gift.reservation && !!gift.reservation.userId)) &&
    !isPurchased &&
    !isReceived;

  const isTaken = isReserved || isPurchased || isReceived;
  const isDraft = !gift.isPublished;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(gift);
  };

  const handleRemove = (e: any) => {
    e.stopPropagation();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onRemove?.(gift);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={styles.container}
    >
      {/* 1. CADRE IMAGE STYLE GALERIE */}
      <View style={styles.imageFrame}>
        {gift.imageUrl ? (
          <Image
            source={gift.imageUrl}
            style={[styles.image, isTaken && styles.imageDimmed]}
            contentFit="cover"
            transition={500}
          />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="gift-outline" size={24} color={THEME.border} />
          </View>
        )}

        {/* OVERLAY D'INDISPONIBILITÉ (Soyeux) */}
        {isTaken && <View style={styles.takenOverlay} />}

        {/* BADGE DE PRIX (Discret, style étiquette) */}
        {gift.estimatedPrice && (
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>{gift.estimatedPrice}€</Text>
          </View>
        )}

        {/* BOUTON SUPPRIMER (Seulement si non réservé/acheté/reçu) */}
        {!isTaken && (
          <TouchableOpacity style={styles.removeCircle} onPress={handleRemove}>
            <Ionicons name="close" size={14} color={THEME.textMain} />
          </TouchableOpacity>
        )}
      </View>

      {/* 2. INFORMATIONS ÉDITORIALES */}
      <View style={styles.infoSection}>
        {/* STATUT (Petit point + Label espacé) */}
        {isTaken || isDraft ? (
          <View style={styles.statusRow}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor:
                    isReceived || isPurchased
                      ? THEME.success
                      : isReserved
                        ? THEME.accent
                        : THEME.textSecondary,
                },
              ]}
            />
            <Text
              style={[
                styles.statusLabel,
                {
                  color:
                    isReceived || isPurchased
                      ? THEME.success
                      : isReserved
                        ? THEME.accent
                        : THEME.textSecondary,
                },
              ]}
            >
              {isReceived
                ? "REÇU"
                : isPurchased
                  ? "ACQUIS"
                  : isReserved
                    ? "RÉSERVÉ"
                    : "BROUILLON"}
            </Text>
          </View>
        ) : (
          <Text style={styles.statusLabel}>DISPONIBLE</Text>
        )}

        {/* TITRE SERIF */}
        <Text
          style={[styles.title, isTaken && styles.titleTaken]}
          numberOfLines={1}
        >
          {gift.title}
        </Text>

        {/* LIGNE DE DÉTAIL FINALE */}
        <View style={styles.footerRow}>
          <Text style={styles.detailLink}>GÉRER</Text>
          <View style={styles.hairline} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default memo(OwnerGiftCard);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "transparent",
  },
  imageFrame: {
    width: "100%",
    aspectRatio: 0.9,
    borderRadius: 0,
    overflow: "hidden",
    backgroundColor: "#F2F2F7",
    borderWidth: 1,
    borderColor: THEME.border,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageDimmed: {
    opacity: 0.6,
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  takenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(253, 251, 247, 0.2)",
  },
  priceTag: {
    position: "absolute",
    bottom: 0,
    left: 0,
    backgroundColor: THEME.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  priceText: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.textMain,
    letterSpacing: -0.5,
  },
  removeCircle: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: THEME.border,
  },
  infoSection: {
    paddingVertical: 12,
    paddingHorizontal: 2,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  statusLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  titleTaken: {
    color: THEME.textSecondary,
    fontStyle: "italic",
    opacity: 0.7,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 10,
  },
  detailLink: {
    fontSize: 8,
    fontWeight: "800",
    color: THEME.accent,
    letterSpacing: 1,
  },
  hairline: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.accent,
    opacity: 0.2,
  },
});
