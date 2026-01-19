import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { router } from 'expo-router';
import { Image } from 'expo-image';

// --- COMPOSANT: CARTE LISTE D'AMI (Slider Item) ---
const FriendWishlistCard = ({ wishlist }: { wishlist: any }) => {
  const owner = wishlist.user;
  const coverImage =
    wishlist.gifts?.[0]?.imageUrl ||
    "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=1000&auto=format&fit=crop";

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.friendCard}
      onPress={() =>
        router.push({
          pathname: "/gifts/wishlists/[wishlistId]",
          params: { wishlistId: wishlist.id },
        })
      }
    >
      <View style={styles.friendCardImageWrapper}>
        <Image
          source={{ uri: coverImage }}
          style={styles.friendCardImage}
          contentFit="cover"
          transition={400}
        />
        {wishlist.eventDate && (
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>
              {new Date(wishlist.eventDate)
                .toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
                .toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.friendCardInfo}>
        <Text style={styles.friendListTitle} numberOfLines={1}>
          {wishlist.title}
        </Text>

        <View style={styles.friendRow}>
          <Image source={{ uri: owner?.image }} style={styles.miniAvatar} />
          <Text style={styles.friendName}>{owner?.name}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default FriendWishlistCard

const styles = StyleSheet.create({
     friendCard: {
    width: 160,
    marginRight: 4,
  },
  friendCardImageWrapper: {
    width: 160,
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    marginBottom: 10,
    position: "relative",
    // Ombre légère
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  friendCardImage: {
    width: "100%",
    height: "100%",
  },
  dateBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backdropFilter: "blur(4px)",
  },
  dateBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#111827",
  },
  friendCardInfo: {
    paddingHorizontal: 4,
  },
  friendListTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginBottom: 4,
  },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  miniAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
  },
  friendName: {
    fontSize: 12,
    color: "#6B7280",
  },})