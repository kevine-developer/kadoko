import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import React, { useState, useCallback } from "react";
import { wishlistService } from "@/lib/services/wishlist-service";
import { giftService } from "@/lib/services/gift-service";
import { authClient } from "@/features/auth";
import { StatusBar, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import OwnerWishlist from "@/components/wishlist/OwnerWishlist";
import GuestWishlist from "@/components/wishlist/GuestWishlist";
import { Skeleton } from "@/components/ui/Skeleton";
import { GiftGridSkeleton } from "@/components/ui/SkeletonGroup";

const THEME = {
  background: "#FDFBF7", // Bone Silk
};

export default function WishlistGroupView() {
  const { wishlistId } = useLocalSearchParams<{ wishlistId: string }>();
  const insets = useSafeAreaInsets();

  // --- STATES ---
  // Data
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id;
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadWishlist = useCallback(async () => {
    if (!wishlistId) return;
    setLoading(true);
    const res = await wishlistService.getWishlistById(wishlistId);
    if (res.success) {
      setGroup(res.wishlist);
    }
    setLoading(false);
  }, [wishlistId]);

  useFocusEffect(
    useCallback(() => {
      loadWishlist();
    }, [loadWishlist]),
  );

  const isOwner = group?.userId === currentUserId;

  const handleUpdateWishlist = async (updatedData: any) => {
    if (!wishlistId) return;
    const res = await wishlistService.updateWishlist(wishlistId, updatedData);
    if (res.success) {
      loadWishlist();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleDeleteWishlist = async () => {
    if (!wishlistId) return;
    const res = await wishlistService.deleteWishlist(wishlistId);
    if (res.success) {
      router.back();
    }
  };

  if (loading && !group) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={{ paddingTop: insets.top + 80, paddingHorizontal: 30 }}>
          <Skeleton
            width={120}
            height={20}
            borderRadius={0}
            style={{ marginBottom: 20 }}
          />
          <Skeleton
            width="90%"
            height={50}
            borderRadius={0}
            style={{ marginBottom: 15 }}
          />
          <Skeleton width="100%" height={80} borderRadius={0} />
          <View style={{ marginTop: 40 }}>
            <GiftGridSkeleton count={1} />
          </View>
        </View>
      </View>
    );
  }

  if (!group) return null;

  if (isOwner) {
    return (
      <OwnerWishlist
        wishlist={group}
        insets={insets}
        onRefresh={loadWishlist}
        handleDeleteWishlist={handleDeleteWishlist}
        handleUpdateWishlist={handleUpdateWishlist}
        handleDeleteGift={async (id) => {
          // --- OPTIMISTIC UI ---
          const previousGroup = { ...group };
          setGroup((prev: any) => ({
            ...prev,
            gifts: prev.gifts.filter((g: any) => g.id !== id),
          }));

          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

          try {
            const res = await giftService.deleteGift(id);
            if (res.success) {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
              // Optionnel: refresh complet pour être sûr
              loadWishlist();
            } else {
              setGroup(previousGroup);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
          } catch {
            setGroup(previousGroup);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
        }}
      />
    );
  }

  return (
    <GuestWishlist wishlist={group} insets={insets} onRefresh={loadWishlist} />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
});
