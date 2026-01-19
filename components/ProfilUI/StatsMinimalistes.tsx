import { StyleSheet, Text, View } from "react-native";
import React from "react";





const StatsMinimalistes = ({userWishlists, reservedGifts, purchasedGifts}: any) => {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{userWishlists?.length || 0}</Text>
        <Text style={styles.statLabel}>Collections</Text>
      </View>
      <View style={styles.verticalLine} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{reservedGifts?.length || 0}</Text>
        <Text style={styles.statLabel}>Réservés</Text>
      </View>
      <View style={styles.verticalLine} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{purchasedGifts?.length || 0}</Text>
        <Text style={styles.statLabel}>Offerts</Text>
      </View>
    </View>
  );
};

export default StatsMinimalistes;

const styles = StyleSheet.create({
  /* STATS */
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  verticalLine: {
    width: 1,
    height: 30,
    backgroundColor: "#F3F4F6",
  },
});
