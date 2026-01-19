import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import FriendWishlistCard from "./FriendWishlistCard";

const FriendsWishlistSlider = ({ wishlists }: { wishlists: any[] }) => {
  if (wishlists.length === 0) return null;

  return (
    <View style={styles.sliderSection}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Le Cercle Proche</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>TOUT VOIR</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sliderContent}
      >
        {wishlists.map((wl) => (
          <FriendWishlistCard key={wl.id} wishlist={wl} />
        ))}
      </ScrollView>
    </View>
  );
};
export default FriendsWishlistSlider;

const styles = StyleSheet.create({
  /* FRIENDS SLIDER (Nouveau) */
  sliderSection: {
    marginBottom: 32,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1,
  },
  sliderContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 20,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
});
