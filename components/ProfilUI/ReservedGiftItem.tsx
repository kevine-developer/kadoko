import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useRef } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

const THEME = {
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062",
  border: "rgba(0,0,0,0.08)",
  success: "#4A6741",
};

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

  return (
    <Animated.View style={[styles.row, { transform: [{ scale: scaleAnim }] }]}>
      <Image source={gift.imageUrl} style={styles.image} contentFit="cover" />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.ownerLabel}>
            {isHistory ? "OFFERT À" : "RÉSERVÉ POUR"}
          </Text>
          <Text style={styles.ownerName}>{ownerName?.toUpperCase()}</Text>
        </View>

        <Text style={styles.title}>{gift.title}</Text>

        {!isHistory && (
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onPurchased}
              style={[styles.mainAction, isPurchasing && { opacity: 0.7 }]}
              disabled={isPurchasing || isReleasing}
            >
              {isPurchasing ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.mainActionText}>MARQUER ACHETÉ</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onUnreserve}
              style={[styles.subAction, isReleasing && { opacity: 0.7 }]}
              disabled={isPurchasing || isReleasing}
            >
              {isReleasing ? (
                <ActivityIndicator size="small" color={THEME.textSecondary} />
              ) : (
                <Ionicons
                  name="trash-outline"
                  size={16}
                  color={THEME.textSecondary}
                />
              )}
            </TouchableOpacity>
          </View>
        )}

        {isHistory && (
          <View style={styles.historyBadge}>
            <Ionicons name="checkmark-circle" size={14} color={THEME.success} />
            <Text style={styles.historyText}>Cadeau délivré</Text>
          </View>
        )}
      </View>

      <View style={styles.priceContainer}>
        <Text style={styles.price}>{gift.estimatedPrice}€</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    alignItems: "center",
  },
  image: { width: 60, height: 60, backgroundColor: "#F9FAFB" },
  content: { flex: 1, marginLeft: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 5,
  },
  ownerLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1,
  },
  ownerName: { fontSize: 9, fontWeight: "800", color: THEME.accent },
  title: {
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
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
    backgroundColor: THEME.textMain,
  },
  mainActionText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 1,
  },
  subAction: { padding: 5 },

  priceContainer: { marginLeft: 15, alignItems: "flex-end" },
  price: { fontSize: 14, fontWeight: "700", color: THEME.textMain },

  historyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
  },
  historyText: { fontSize: 11, fontWeight: "600", color: THEME.success },
});
