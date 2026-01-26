import { StyleSheet, View } from "react-native";
import React from "react";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import { Gift, GiftWishlist } from "@/types/gift";
import { StatEntry } from "./ui/StatEntry";

interface StatsMinimalistesProps {
  userWishlists: GiftWishlist[];
  reservedGifts: Gift[];
  purchasedGifts: Gift[];
}

const StatsMinimalistes = ({
  userWishlists,
  reservedGifts,
  purchasedGifts,
}: StatsMinimalistesProps) => {

  const theme = useAppTheme();
  return (
    <View style={[styles.statsContainer, { borderColor: theme.border }]}>
      <StatEntry value={userWishlists?.length} label="Collections" />

      <View style={[styles.divider, { backgroundColor: theme.accent }]} />

      <StatEntry value={reservedGifts?.length} label="Réservés" />

      <View style={[styles.divider, { backgroundColor: theme.accent }]} />

      <StatEntry value={purchasedGifts?.length} label="Offerts" />
    </View>
  );
};

export default StatsMinimalistes;

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginTop: 10,
  },
  divider: {
    width: 1,
    height: 15,
    opacity: 0.3,
  },
});
