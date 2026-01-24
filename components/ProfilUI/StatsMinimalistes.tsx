import { StyleSheet, Text, View, Platform } from "react-native";
import React from "react";

const THEME = {
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.06)",
};

const StatsMinimalistes = ({ userWishlists, reservedGifts, purchasedGifts }: any) => {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{userWishlists?.length || 0}</Text>
        <Text style={styles.statLabel}>Collections</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{reservedGifts?.length || 0}</Text>
        <Text style={styles.statLabel}>Réservés</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{purchasedGifts?.length || 0}</Text>
        <Text style={styles.statLabel}>Offerts</Text>
      </View>
    </View>
  );
};

export default StatsMinimalistes;

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: THEME.border,
    marginTop: 10,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 22,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 9,
    color: THEME.textSecondary,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  divider: {
    width: 1,
    height: 15,
    backgroundColor: THEME.accent,
    opacity: 0.4,
  },
});