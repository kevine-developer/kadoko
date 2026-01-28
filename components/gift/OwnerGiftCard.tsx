import { Image } from "expo-image";
import React, { memo } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import * as Haptics from "expo-haptics";

import { Gift } from "@/types/gift";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";

type OwnerGiftCardProps = {
  gift: Gift;
  onPress: (gift: Gift) => void;
  onRemove?: (gift: Gift) => void;
};

function OwnerGiftCard({ gift, onPress, onRemove }: OwnerGiftCardProps) {
  const theme = useAppTheme();

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
      <View
        style={[
          styles.imageFrame,
          { borderColor: theme.border, backgroundColor: theme.surface },
        ]}
      >
        {gift.imageUrl ? (
          <Image
            source={gift.imageUrl}
            style={[styles.image, isTaken && styles.imageDimmed]}
            contentFit="cover"
            transition={500}
          />
        ) : (
          <View style={styles.placeholder}>
            <ThemedIcon name="gift-outline" size={24} colorName="border" />
          </View>
        )}

        {isTaken && (
          <View
            style={[
              styles.takenOverlay,
              {
                backgroundColor:
                  theme.background === "#FFFFFF"
                    ? "rgba(253, 251, 247, 0.2)"
                    : "rgba(0,0,0,0.4)",
              },
            ]}
          />
        )}

        {gift.estimatedPrice && (
          <View
            style={[
              styles.priceTag,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <ThemedText type="default" bold style={styles.priceText}>
              {gift.estimatedPrice}€
            </ThemedText>
          </View>
        )}

        {!isTaken && (
          <TouchableOpacity
            style={[
              styles.removeCircle,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
            onPress={handleRemove}
          >
            <ThemedIcon name="close" size={14} colorName="textMain" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.infoSection}>
        {isTaken || isDraft ? (
          <View style={styles.statusRow}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor:
                    isReceived || isPurchased
                      ? theme.success
                      : isReserved
                        ? theme.accent
                        : theme.textSecondary,
                },
              ]}
            />
            <ThemedText
              type="label"
              style={[
                styles.statusLabel,
                {
                  color:
                    isReceived || isPurchased
                      ? theme.success
                      : isReserved
                        ? theme.accent
                        : theme.textSecondary,
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
            </ThemedText>
          </View>
        ) : (
          <ThemedText
            type="label"
            style={[styles.statusLabel, { color: theme.textSecondary }]}
          >
            DISPONIBLE
          </ThemedText>
        )}

        <ThemedText
          type="subtitle"
          style={[
            styles.title,
            isTaken && styles.titleTaken,
            { color: theme.textMain },
          ]}
          numberOfLines={1}
        >
          {gift.title}
        </ThemedText>

        <View style={styles.footerRow}>
          <ThemedText type="label" colorName="accent" style={styles.detailLink}>
            GÉRER
          </ThemedText>
          <View style={[styles.hairline, { backgroundColor: theme.accent }]} />
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
    borderWidth: 1,
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
  },
  priceTag: {
    position: "absolute",
    bottom: 0,
    left: 0,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  priceText: {
    fontSize: 12,
    letterSpacing: -0.5,
  },
  removeCircle: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
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
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  titleTaken: {
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
    letterSpacing: 1,
  },
  hairline: {
    flex: 1,
    height: 1,
    opacity: 0.2,
  },
});
