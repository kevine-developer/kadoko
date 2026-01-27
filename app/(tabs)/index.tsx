import CreateWishlistBanner from "@/components/HomeUI/CreateWishlistBanner";
import GiftCardHome from "@/components/HomeUI/GiftCardHome";
import HeaderHome from "@/components/HomeUI/HeaderHome";
import { authClient } from "@/features/auth";
import { giftService } from "@/lib/services/gift-service";
import { wishlistService } from "@/lib/services/wishlist-service";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";

import { Skeleton } from "@/components/ui/Skeleton";
import { GiftCardSkeleton } from "@/components/ui/SkeletonGroup";
import { socketService } from "@/lib/services/socket";
import GiftFriendBuy from "@/components/HomeUI/GiftFriendBuy";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";
import MailVerified from "@/components/HomeUI/MailVerified";
import EmptyFeed from "@/components/HomeUI/EmptyFeed";

// --- SKELETON GÉOMÉTRIQUE ---
const HomeSkeleton = () => (
  <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
    <View style={{ flexDirection: "row", gap: 10, marginBottom: 40 }}>
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} width={70} height={70} borderRadius={0} />
      ))}
    </View>
    <Skeleton
      width="100%"
      height={180}
      borderRadius={0}
      style={{ marginBottom: 40 }}
    />
    <Skeleton
      width={150}
      height={30}
      borderRadius={0}
      style={{ marginBottom: 20 }}
    />
    <GiftCardSkeleton />
  </View>
);

export default function LuxuryFeedScreen() {
  const [inspirations, setInspirations] = useState<any[]>([]);
  const [receivedGifts, setReceivedGifts] = useState<any[]>([]);
  const [myWishlists, setMyWishlists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- THEME ---
  const theme = useAppTheme();

  const { data: session } = authClient.useSession();

  const loadFeed = useCallback(
    async (isRefetching = false) => {
      if (!session) return;
      try {
        if (!isRefetching) setLoading(true);
        const data = await giftService.getFeed();
        if (data.success) {
          setInspirations(data.inspirations);
          setReceivedGifts(data.received);
        }
      } catch (error) {
        console.error("Failed to load feed:", error);
      } finally {
        if (!isRefetching) setLoading(false);
      }
    },
    [session],
  );

  const loadMyWishlists = useCallback(async () => {
    if (!session) return;
    try {
      const data = await wishlistService.getMyWishlists();
      if (data.success) {
        setMyWishlists(data.wishlists);
      }
    } catch (error) {
      console.error("Failed to load wishlists:", error);
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      loadFeed();
      loadMyWishlists();

      const handleGiftUpdate = (updatedGift: any) => {
        setInspirations((prev) =>
          prev.map((item) =>
            item.id === updatedGift.id ? { ...item, ...updatedGift } : item,
          ),
        );

        const ownerId =
          updatedGift.wishlist?.userId || updatedGift.wishlist?.user?.id;
        const myId = session?.user?.id;

        if (ownerId && myId && ownerId === myId) {
          setReceivedGifts((prev) => {
            const isIncoming =
              updatedGift.status === "RESERVED" ||
              updatedGift.status === "PURCHASED";
            const exists = prev.find((g) => g.id === updatedGift.id);
            if (isIncoming) {
              const giftWithCrowd = {
                ...updatedGift,
                crowd: updatedGift.crowd || 1,
              };
              return exists
                ? prev.map((g) => (g.id === updatedGift.id ? giftWithCrowd : g))
                : [giftWithCrowd, ...prev];
            }
            return prev.filter((g) => g.id !== updatedGift.id);
          });
        }
      };

      socketService.connect(session?.user?.id);
      socketService.on("gift:updated", handleGiftUpdate);
      return () => socketService.off("gift:updated", handleGiftUpdate);
    }, [loadFeed, loadMyWishlists, session?.user?.id]),
  );

  const onRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRefreshing(true);
    await Promise.all([loadFeed(true), loadMyWishlists()]);
    setRefreshing(false);
  }, [loadFeed, loadMyWishlists]);

  const feedPosts = useMemo(() => {
    return inspirations.map((gift) => ({
      id: gift.id,
      user: {
        name: gift.wishlist?.user?.name ?? "Membre",
        avatar: gift.wishlist?.user?.image ?? "https://i.pravatar.cc/150",
      },
      product: {
        name: gift.title,
        image: gift.imageUrl,
        price: gift.estimatedPrice || 0,
      },
      wishlistId: gift.wishlistId,
      context: gift.wishlist?.title || "Collection privée",
      status: gift.status,
      isReserved: gift.status === "RESERVED",
      isPurchased: gift.status === "PURCHASED",
      reservedBy: gift.reservedBy,
      purchasedBy: gift.purchasedBy,
      isMyReservation: gift.reservedById === session?.user?.id,
      isMyPurchase: gift.purchasedById === session?.user?.id,
      eventDate: gift.wishlist?.eventDate,
      eventType: gift.wishlist?.eventType,
    }));
  }, [inspirations, session?.user?.id]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        stickyHeaderIndices={[1]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.textMain}
            colors={[theme.textMain]}
            progressBackgroundColor={theme.background}
          />
        }
      >
        <HeaderHome user={session?.user} />

        {/* 2. TICKER D'ACTUALITÉ / ALERTE */}
        {session?.user?.emailVerified === false && (
          <MailVerified />
        )}
        {loading && !refreshing ? (
          <HomeSkeleton />
        ) : (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "timing", duration: 700 }}
          >
            {/* 3. CERCLE */}
            {receivedGifts.length > 0 && (
              <View style={styles.sectionContainer}>
                <GiftFriendBuy gifts={receivedGifts} />
              </View>
            )}

            {/* 4. BANNIÈRE CRÉATION */}
            {myWishlists.length === 0 && (
              <View style={styles.bannerWrapper}>
                <CreateWishlistBanner
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push("/(screens)/createEventScreen");
                  }}
                />
              </View>
            )}

            {/* 5. LE JOURNAL (Feed) */}
            <View style={styles.feedSection}>
              <View style={styles.sectionHeader}>
                <ThemedText type="subtitle">Les plaisirs partagés</ThemedText>
                <View
                  style={[
                    styles.sectionDivider,
                    { backgroundColor: theme.accent },
                  ]}
                />
              </View>

              {feedPosts.length > 0 ? (
                feedPosts.map((post) => (
                  <GiftCardHome key={post.id} item={post} />
                ))
              ) : (
                <EmptyFeed />
              )}
            </View>
          </MotiView>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tickerContainer: { zIndex: 10, paddingBottom: 10 },

  sectionContainer: { marginBottom: 40 },
  bannerWrapper: { paddingHorizontal: 20, marginBottom: 40 },
  feedSection: { paddingHorizontal: 20 },
  sectionHeader: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, letterSpacing: -0.5 },
  sectionDivider: { width: 40, height: 2, marginTop: 15 },

});
