import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { router } from "expo-router";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";

const FriendWishlistCard = ({ wishlist }: { wishlist: any }) => {
  const theme = useAppTheme();
  const owner = wishlist.user;
  const coverImage =
    wishlist.gifts?.[0]?.imageUrl ||
    "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=1000&auto=format&fit=crop";

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/gifts/wishlists/[wishlistId]",
      params: { wishlistId: wishlist.id },
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.cardContainer}
      onPress={handlePress}
    >
      <View
        style={[
          styles.imageFrame,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Image
          source={{ uri: coverImage }}
          style={styles.image}
          contentFit="cover"
          transition={500}
        />

        {wishlist.eventDate && (
          <View
            style={[
              styles.dateTag,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <ThemedText type="label" style={styles.dateText}>
              {new Date(wishlist.eventDate)
                .toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
                .toUpperCase()}
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.infoContent}>
        <ThemedText type="subtitle" style={styles.title} numberOfLines={1}>
          {wishlist.title}
        </ThemedText>

        <View style={styles.authorRow}>
          <Image
            source={{ uri: owner?.image }}
            style={[styles.squareAvatar, { backgroundColor: theme.border }]}
          />
          <ThemedText
            type="label"
            colorName="textSecondary"
            style={styles.authorName}
            numberOfLines={1}
          >
            {owner?.name}
          </ThemedText>
        </View>

        <View style={[styles.accentLine, { backgroundColor: theme.accent }]} />
      </View>
    </TouchableOpacity>
  );
};

export default FriendWishlistCard;

const styles = StyleSheet.create({
  cardContainer: {
    width: 150,
    marginRight: 12,
  },
  imageFrame: {
    width: 150,
    height: 200,
    borderRadius: 0,
    marginBottom: 12,
    position: "relative",
    borderWidth: 1,
  },
  image: {
    width: "100%",
    height: "100%",
    opacity: 0.9,
  },
  dateTag: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  dateText: {
    fontSize: 9,
    letterSpacing: 1,
  },
  infoContent: {
    paddingHorizontal: 2,
  },
  title: {
    fontSize: 16,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  squareAvatar: {
    width: 18,
    height: 18,
    borderRadius: 0,
  },
  authorName: {
    letterSpacing: 1,
    flex: 1,
  },
  accentLine: {
    width: 20,
    height: 1,
    opacity: 0.5,
  },
});
