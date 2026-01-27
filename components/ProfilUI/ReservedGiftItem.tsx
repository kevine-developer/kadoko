import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import React, { useRef } from "react";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";

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
                <ThemedIcon
                  name="trash-outline"
                  size={16}
                  colorName="textSecondary"
                />
              )}
            </TouchableOpacity>
          </View>
        )}

        {isHistory && (
          <View style={styles.historyBadge}>
            <ThemedIcon name="checkmark-circle" size={14} colorName="success" />
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
    borderRadius: 0,
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
    borderRadius: 0,
  },
  mainActionText: {
    fontSize: 9,
    color: "#FFF",
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
