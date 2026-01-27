import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import React from "react";
import { Image } from "expo-image";
import { MotiView } from "moti";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";

const OpportunityCard = ({ opp, index, handleContribute }: any) => {
  const theme = useAppTheme();
  const remaining = opp.price - opp.currentAmount;
  const percent = (opp.currentAmount / opp.price) * 100;

  return (
    <MotiView
      key={opp.id}
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: index * 150 + 300 }}
      style={[
        styles.oppCard,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <Image
        source={{ uri: opp.image }}
        style={[styles.oppImage, { backgroundColor: theme.border }]}
        contentFit="cover"
      />

      <View style={styles.oppContent}>
        <View style={styles.oppHeader}>
          <View style={styles.friendBadge}>
            <Image
              source={{ uri: opp.friendAvatar }}
              style={styles.friendAvatar}
            />
            <ThemedText type="defaultBold" style={styles.friendName}>
              {opp.friendName}
            </ThemedText>
          </View>
          <ThemedText
            type="label"
            colorName="accent"
            style={styles.deadlineText}
          >
            {opp.deadline.toUpperCase()}
          </ThemedText>
        </View>

        <ThemedText type="title" style={styles.giftName} numberOfLines={1}>
          {opp.giftName}
        </ThemedText>

        {opp.currentAmount > 0 ? (
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${percent}%`, backgroundColor: theme.accent },
                ]}
              />
            </View>
            <ThemedText type="caption" colorName="textSecondary">
              Manque{" "}
              <ThemedText type="defaultBold" colorName="accent">
                {remaining}€
              </ThemedText>
            </ThemedText>
          </View>
        ) : (
          <ThemedText
            type="caption"
            colorName="textSecondary"
            style={styles.priceText}
          >
            {opp.price}€ — GESTE ACCESSIBLE
          </ThemedText>
        )}

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.textMain }]}
          onPress={() => handleContribute(remaining > 20 ? 20 : remaining)}
        >
          <ThemedText type="label" style={{ color: theme.background }}>
            {opp.currentAmount > 0
              ? "COMPLÉTER LA CAGNOTTE"
              : "OFFRIR MAINTENANT"}
          </ThemedText>
          <ThemedIcon name="arrow-forward" size={12} color={theme.background} />
        </TouchableOpacity>
      </View>
    </MotiView>
  );
};

export default OpportunityCard;

const styles = StyleSheet.create({
  oppCard: {
    borderWidth: 1,
    flexDirection: "row",
    height: 160,
  },
  oppImage: {
    width: 110,
    height: "100%",
  },
  oppContent: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  oppHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  friendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  friendAvatar: { width: 20, height: 20, borderRadius: 10 },
  friendName: { fontSize: 12 },
  deadlineText: { fontSize: 9 },
  giftName: {
    fontSize: 18,
    lineHeight: 22,
  },
  progressContainer: { gap: 6 },
  progressBarBg: {
    height: 4,
    backgroundColor: "#E5E7EB",
    width: "100%",
    borderRadius: 2,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  priceText: {
    fontWeight: "600",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 5,
  },
});
