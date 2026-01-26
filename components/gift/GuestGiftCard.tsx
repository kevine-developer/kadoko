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
import { authClient } from "@/features/auth";

// --- THEME ÉDITORIAL COHÉRENT ---
const THEME = {
  background: "#FDFBF7", // Bone Silk
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.08)",
  success: "#4A6741", // Vert forêt luxe
};

type GuestGiftCardProps = {
  gift: Gift;
  onPress: (gift: Gift) => void;
};

function GuestGiftCard({ gift, onPress }: GuestGiftCardProps) {
  const { data: session } = authClient.useSession();

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
  const isReservedByMe =
    gift.reservedById === session?.user?.id ||
    gift.reservation?.userId === session?.user?.id;

  const isTaken = isReserved || isPurchased || isReceived;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(gift);
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

        {/* OVERLAY D'INDISPONIBILITÉ (Voile soie) */}
        {isTaken && (
          <View style={styles.takenOverlay}>
            <View style={styles.takenLabel}>
              <Text style={styles.takenLabelText}>
                {isReceived
                  ? "PIÈCE REÇUE"
                  : isPurchased
                    ? "ACQUISE"
                    : isReservedByMe
                      ? "RÉSERVÉE PAR VOUS"
                      : "RÉSERVÉE"}
              </Text>
            </View>
          </View>
        )}

        {/* BADGE DE PRIX */}
        {gift.estimatedPrice && (
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>{gift.estimatedPrice}€</Text>
          </View>
        )}
      </View>

      {/* 2. INFORMATIONS ÉDITORIALES */}
      <View style={styles.infoSection}>
        {/* STATUT */}
        {isReservedByMe ? (
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: THEME.accent }]} />
            <Text style={[styles.statusLabel, { color: THEME.accent }]}>
              VOTRE RÉSERVATION
            </Text>
          </View>
        ) : isTaken ? (
          <View style={styles.statusRow}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: isReceived
                    ? THEME.success
                    : THEME.textSecondary,
                },
              ]}
            />
            <Text
              style={[
                styles.statusLabel,
                { color: isReceived ? THEME.success : THEME.textSecondary },
              ]}
            >
              {isReceived
                ? "OFFERT ET REÇU"
                : isPurchased
                  ? "PIÈCE ACQUISE"
                  : "DÉJÀ RÉSERVÉ"}
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
          <Text style={styles.detailLink}>DÉCOUVRIR</Text>
          <View style={styles.hairline} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default memo(GuestGiftCard);

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
    backgroundColor: "rgba(253, 251, 247, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  takenLabel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: THEME.surface,
    borderWidth: 0.5,
    borderColor: THEME.accent,
  },
  takenLabelText: {
    color: THEME.accent,
    fontWeight: "900",
    letterSpacing: 1,
    fontSize: 7,
    textTransform: "uppercase",
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
