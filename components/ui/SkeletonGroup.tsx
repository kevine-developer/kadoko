import { View, StyleSheet, Dimensions } from "react-native";
import React from "react";
import { Skeleton } from "./Skeleton";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 48) / 2; // Assuming 2 columns with padding

// 1. Gift Card Skeleton
export const GiftCardSkeleton = () => {
  return (
    <View style={styles.cardContainer}>
      <Skeleton width="100%" height={160} borderRadius={16} />
      <View style={{ marginTop: 12 }}>
        <Skeleton width="80%" height={16} borderRadius={4} />
        <View
          style={{
            marginTop: 8,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Skeleton width="40%" height={14} borderRadius={4} />
          <Skeleton width={24} height={24} borderRadius={12} />
        </View>
      </View>
    </View>
  );
};

// 2. Profile Skeleton
export const ProfileHeaderSkeleton = () => {
  return (
    <View style={styles.profileContainer}>
      <View style={{ paddingHorizontal: 20, marginTop: -40 }}>
        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          <Skeleton
            width={80}
            height={80}
            borderRadius={40}
            style={{ borderWidth: 4, borderColor: "#FFF" }}
          />
        </View>

        {/* Info */}
        <View style={{ marginTop: 12 }}>
          <Skeleton width={150} height={24} borderRadius={6} />
          <Skeleton
            width={100}
            height={16}
            borderRadius={4}
            style={{ marginTop: 8 }}
          />
          <Skeleton
            width="100%"
            height={40}
            borderRadius={4}
            style={{ marginTop: 12 }}
          />
        </View>

        {/* Stats */}
        <View style={{ flexDirection: "row", gap: 24, marginTop: 24 }}>
          <Skeleton width={60} height={40} borderRadius={8} />
          <Skeleton width={60} height={40} borderRadius={8} />
          <Skeleton width={60} height={40} borderRadius={8} />
        </View>
      </View>
    </View>
  );
};

// 3. User List Item Skeleton
export const UserListItemSkeleton = () => {
  return (
    <View style={styles.userItemContainer}>
      <Skeleton width={50} height={50} borderRadius={25} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Skeleton width={120} height={16} borderRadius={4} />
        <Skeleton
          width={80}
          height={12}
          borderRadius={4}
          style={{ marginTop: 6 }}
        />
      </View>
      <Skeleton width={80} height={32} borderRadius={16} />
    </View>
  );
};

// 4. Wishlist Card Skeleton
export const WishlistCardSkeleton = () => {
  return (
    <View style={styles.wishlistCard}>
      <Skeleton width={60} height={60} borderRadius={16} />
      <View style={{ marginTop: 12 }}>
        <Skeleton width="90%" height={16} borderRadius={4} />
        <Skeleton
          width="60%"
          height={12}
          borderRadius={4}
          style={{ marginTop: 8 }}
        />
      </View>
      <View
        style={{
          marginTop: 16,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Skeleton width={40} height={20} borderRadius={10} />
      </View>
    </View>
  );
};

// 5. Grid helper for Gifts
export const GiftGridSkeleton = ({ count = 4 }) => {
  return (
    <View style={styles.gridContainer}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{ width: COLUMN_WIDTH, marginBottom: 16 }}>
          <GiftCardSkeleton />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  profileContainer: {
    backgroundColor: "#fff",
    paddingBottom: 24,
  },
  avatarWrapper: {
    alignSelf: "flex-start",
  },
  userItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
    borderRadius: 12,
  },
  wishlistCard: {
    width: 160,
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 20,
    marginRight: 16,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
});
