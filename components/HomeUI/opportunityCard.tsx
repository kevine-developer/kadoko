import { StyleSheet, Text, TouchableOpacity, View,Platform } from "react-native";
import React from "react";
import { Image } from "expo-image";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";

// --- THEME ---
const THEME = {
  background: "#FDFBF7",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062", // Or
  mystery: "#1A1A1A", // Noir profond pour le mystère
  border: "rgba(0,0,0,0.08)",
  surface: "#FDFBF7",
};



const OpportunityCard = ({ opp, index, handleContribute }: any) => {

        const remaining = opp.price - opp.currentAmount;
              const percent = (opp.currentAmount / opp.price) * 100;

  return (
    <MotiView
      key={opp.id}
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: index * 150 + 300 }}
      style={styles.oppCard}
    >
      {/* Image Produit */}
      <Image
        source={{ uri: opp.image }}
        style={styles.oppImage}
        contentFit="cover"
      />

      <View style={styles.oppContent}>
        {/* Header: Ami & Délai */}
        <View style={styles.oppHeader}>
          <View style={styles.friendBadge}>
            <Image
              source={{ uri: opp.friendAvatar }}
              style={styles.friendAvatar}
            />
            <Text style={styles.friendName}>{opp.friendName}</Text>
          </View>
          <Text style={styles.deadlineText}>{opp.deadline.toUpperCase()}</Text>
        </View>

        <Text style={styles.giftName} numberOfLines={1}>
          {opp.giftName}
        </Text>

        {/* Progress Bar (Gamification) */}
        {opp.currentAmount > 0 ? (
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View
                style={[styles.progressBarFill, { width: `${percent}%` }]}
              />
            </View>
            <Text style={styles.progressText}>
              Manque{" "}
              <Text style={{ fontWeight: "700", color: THEME.accent }}>
                {remaining}€
              </Text>
            </Text>
          </View>
        ) : (
          <Text style={styles.priceText}>{opp.price}€ — GESTE ACCESSIBLE</Text>
        )}

        {/* Action */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleContribute(remaining > 20 ? 20 : remaining)}
        >
          <Text style={styles.actionBtnText}>
            {opp.currentAmount > 0
              ? "COMPLÉTER LA CAGNOTTE"
              : "OFFRIR MAINTENANT"}
          </Text>
          <Ionicons name="arrow-forward" size={12} color="#FFF" />
        </TouchableOpacity>
      </View>
    </MotiView>
  );
};

export default OpportunityCard;

const styles = StyleSheet.create({  oppCard: {
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    flexDirection: "row",
    height: 160, // Carte horizontale
  },
  oppImage: {
    width: 110,
    height: "100%",
    backgroundColor: "#F2F2F7",
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
  friendName: { fontSize: 12, fontWeight: "700", color: THEME.textMain },
  deadlineText: { fontSize: 9, color: THEME.accent, fontWeight: "800" },

  giftName: {
    fontSize: 18,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
  },

  /* PROGRESS BAR */
  progressContainer: { gap: 6 },
  progressBarBg: {
    height: 4,
    backgroundColor: "#E5E7EB",
    width: "100%",
    borderRadius: 2,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: THEME.accent,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    color: THEME.textSecondary,
  },
  priceText: {
    fontSize: 11,
    fontWeight: "600",
    color: THEME.textSecondary,
  },

  /* ACTION BTN */
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: THEME.textMain,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 5,
  },
  actionBtnText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },});
