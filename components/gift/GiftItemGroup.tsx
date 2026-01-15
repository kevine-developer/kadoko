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

import { Gift } from "@/types/gift";

// --- THEME LUXE ---
const THEME = {
  white: "#FFFFFF",
  black: "#111827",
  textMain: "#111827",
  textSecondary: "#6B7280",
  placeholder: "#F3F4F6",
  danger: "#EF4444",
  border: "rgba(0,0,0,0.06)",
  success: "#10B981", // Vert émeraude
  warning: "#F59E0B", // Ambre doré
};

type GiftItemProps = {
  gift: Gift;
  onPress: (gift: Gift) => void;
  onRemove?: (gift: Gift) => void;
  isOwner?: boolean;
};

function GiftItemGroup({
  gift,
  onPress,
  onRemove,
  isOwner = false,
}: GiftItemProps) {
  const hasPrice = !!gift.estimatedPrice;

  // Vérification des statuts
  const isReserved =
    gift.status === "RESERVED" ||
    (gift.reservation && !!gift.reservation.userId);
  const isPurchased =
    gift.status === "PURCHASED" || (gift.purchase && !!gift.purchase.userId);
  const isTaken = isReserved || isPurchased;

  // Définition du texte et de la couleur du badge
  let statusLabel = "";
  let statusColor = THEME.textSecondary;

  if (isPurchased) {
    statusLabel = "OFFERT";
    statusColor = THEME.success;
  } else if (isReserved) {
    statusLabel = "RÉSERVÉ";
    statusColor = THEME.warning;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => onPress(gift)}
      style={styles.cardContainer}
    >
      {/* 1. LAYER IMAGE */}
      <View style={styles.imageWrapper}>
        {gift.imageUrl ? (
          <Image
            source={gift.imageUrl}
            style={styles.image}
            contentFit="cover"
            transition={400}
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons name="gift-outline" size={32} color="#9CA3AF" />
          </View>
        )}

        {/* Overlay sombre si l'objet est pris (Indication visuelle d'indisponibilité) */}
        {isTaken && <View style={styles.takenOverlay} />}
      </View>

      {/* 2. ACTIONS & STATUTS (Top) */}
      <View style={styles.topRow}>
        {/* Badge Prix (Gauche) */}
        {hasPrice ? (
          <View style={[styles.badgeBase, styles.priceTag]}>
            <Text style={styles.priceText}>{gift.estimatedPrice}€</Text>
          </View>
        ) : (
          <View />
        )}

        {/* Zone Droite : Soit Suppression, Soit Statut */}
        <View style={styles.topRightActions}>
          {/* Affiche le statut si pris */}
          {isTaken && (
            <View style={[styles.badgeBase, styles.statusBadge]}>
              {/* Petit cadenas ou check */}
              <Ionicons
                name={isPurchased ? "checkmark-circle" : "lock-closed"}
                size={10}
                color={statusColor}
              />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {statusLabel}
              </Text>
            </View>
          )}

          {/* Affiche le bouton supprimer SEULEMENT si propriétaire ET non pris */}
          {isOwner && !isTaken && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={(e) => {
                e.stopPropagation();
                onRemove?.(gift);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={14} color={THEME.black} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 3. INFO PANEL (Bottom Floating Label) */}
      <View style={[styles.infoLabel, isTaken && styles.infoLabelTaken]}>
        <Text
          style={[styles.title, isTaken && styles.textTaken]}
          numberOfLines={2}
        >
          {gift.title}
        </Text>

        <View style={styles.footerRow}>
          <Text style={styles.actionText}>DÉCOUVRIR</Text>
          <Ionicons
            name="arrow-forward"
            size={10}
            color={THEME.textSecondary}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default memo(GiftItemGroup);

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    height: 220,
    borderRadius: 20,
    position: "relative",
    backgroundColor: THEME.placeholder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },

  /* --- IMAGE --- */
  imageWrapper: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: THEME.placeholder,
  },
  placeholderContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  takenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.4)", // Voile blanc pour "désactiver" visuellement
  },

  /* --- TOP ROW --- */
  topRow: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    zIndex: 10,
  },
  topRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  /* BADGES COMMUNS */
  badgeBase: {
    backgroundColor: THEME.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priceTag: {
    // Spécifique prix
  },
  priceText: {
    color: THEME.black,
    fontWeight: "700",
    fontSize: 12,
  },
  statusBadge: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  /* REMOVE BUTTON */
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },

  /* --- INFO LABEL --- */
  infoLabel: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: THEME.white,
    borderRadius: 14,
    padding: 12,
    justifyContent: "space-between",
    minHeight: 70,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  infoLabelTaken: {
    backgroundColor: "#F9FAFB", // Fond légèrement grisé si pris
  },
  title: {
    fontSize: 15,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    lineHeight: 18,
    marginBottom: 4,
  },
  textTaken: {
    color: "#9CA3AF", // Texte grisé si pris
    textDecorationLine: "line-through", // Optionnel : barrer le titre
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
  },
  actionText: {
    fontSize: 9,
    color: THEME.textSecondary,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
