import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useRef } from "react";
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";

export default function ReservedGiftItem({
  gift,
  ownerName,
  onPurchased,
  onUnreserve,
  isHistory,
  isPurchasing,
  isReleasing,
}: any) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const theme = useAppTheme();
  return (
    <Animated.View
      style={[
        styles.row,
        { borderBottomColor: theme.border, transform: [{ scale: scaleAnim }] },
      ]}
    >
      {/* Image format carré "Galerie" */}
      <Image
        source={gift.imageUrl}
        style={[styles.image, { backgroundColor: theme.surface }]}
        contentFit="cover"
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText
            type="label"
            style={{ color: theme.textSecondary, fontSize: 8 }}
          >
            {isHistory ? "OFFERT À" : "RÉSERVÉ POUR"}
          </ThemedText>
          <ThemedText type="label" style={{ color: theme.accent, fontSize: 9 }}>
            {ownerName?.toUpperCase()}
          </ThemedText>
        </View>

        {/* Titre en Serif (Georgia) via type="title" */}
        <ThemedText type="title" style={styles.title}>
          {gift.title}
        </ThemedText>

        {!isHistory && (
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onPurchased}
              style={[
                styles.mainAction,
                { backgroundColor: theme.textMain },
                isPurchasing && { opacity: 0.7 },
              ]}
              disabled={isPurchasing || isReleasing}
            >
              {isPurchasing ? (
                <ActivityIndicator size="small" color={theme.surface} />
              ) : (
                <ThemedText type="label" style={styles.mainActionText}>
                  MARQUER ACHETÉ
                </ThemedText>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onUnreserve}
              style={[styles.subAction, isReleasing && { opacity: 0.7 }]}
              disabled={isPurchasing || isReleasing}
            >
              {isReleasing ? (
                <ActivityIndicator size="small" color={theme.textSecondary} />
              ) : (
                <Ionicons
                  name="trash-outline"
                  size={16}
                  color={theme.textSecondary}
                />
              )}
            </TouchableOpacity>
          </View>
        )}

        {isHistory && (
          <View style={styles.historyBadge}>
            <Ionicons name="checkmark-circle" size={14} color={theme.success} />
            <ThemedText
              type="caption"
              style={{ color: theme.success, fontWeight: "600" }}
            >
              Cadeau délivré
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.priceContainer}>
        <ThemedText type="defaultBold" style={{ color: theme.textMain }}>
          {gift.estimatedPrice}€
        </ThemedText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingVertical: 20,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 0, // Style boutique/carré
  },
  content: {
    flex: 1,
    marginLeft: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 5,
  },
  title: {
    fontSize: 16,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 15,
  },
  mainAction: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 0, // Rectangulaire luxe
  },
  mainActionText: {
    fontSize: 9,
    color: "#FFF", // On garde blanc car le fond du bouton est textMain (noir)
  },
  subAction: {
    padding: 5,
  },
  priceContainer: {
    marginLeft: 15,
    alignItems: "flex-end",
  },
  historyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
  },
});
