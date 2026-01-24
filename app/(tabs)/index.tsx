import CreateWishlistBanner from "@/components/HomeUI/CreateWishlistBanner";
import GiftCardHome from "@/components/HomeUI/GiftCardHome";
import HeaderHome from "@/components/HomeUI/HeaderHome";
import RadarTicker from "@/components/HomeUI/RadarTicker";
import { authClient } from "@/features/auth";
import { giftService } from "@/lib/services/gift-service";
import { wishlistService } from "@/lib/services/wishlist-service";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";

import { Skeleton } from "@/components/ui/Skeleton";
import { GiftCardSkeleton } from "@/components/ui/SkeletonGroup";
import { socketService } from "@/lib/services/socket";
import GiftFriendBuy from "@/components/HomeUI/GiftFriendBuy";

// --- THEME ÉDITORIAL ---
const THEME = {
  background: "#FDFBF7", // Bone Silk
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.08)",
  danger: "#C34A4A",
};

// --- SKELETON GÉOMÉTRIQUE ---
const HomeSkeleton = () => (
  <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
    {/* Slider Stories */}
    <View style={{ flexDirection: "row", gap: 10, marginBottom: 40 }}>
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} width={70} height={70} borderRadius={0} />
      ))}
    </View>

    {/* Bannière rectangulaire */}
    <Skeleton
      width="100%"
      height={180}
      borderRadius={0}
      style={{ marginBottom: 40 }}
    />

    {/* Titre Section */}
    <Skeleton
      width={150}
      height={30}
      borderRadius={0}
      style={{ marginBottom: 20 }}
    />

    {/* Cartes */}
    <GiftCardSkeleton />
  </View>
);

export default function LuxuryFeedScreen() {
  const [inspirations, setInspirations] = useState<any[]>([]);
  const [receivedGifts, setReceivedGifts] = useState<any[]>([]);
  const [myWishlists, setMyWishlists] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
        console.log(
          "🎁 Socket event received:",
          updatedGift.title,
          updatedGift.status,
        );

        // 1. Mettre à jour les inspirations (Feed général)
        setInspirations((prev) =>
          prev.map((item) => {
            if (item.id === updatedGift.id) {
              return { ...item, ...updatedGift };
            }
            return item;
          }),
        );

        // 2. Mettre à jour "Cadeaux en approche" (Mes listes)
        // On check si le cadeau appartient à l'une de nos wishlists
        const ownerId =
          updatedGift.wishlist?.userId || updatedGift.wishlist?.user?.id;
        const myId = session?.user?.id;

        if (ownerId && myId && ownerId === myId) {
          console.log("✨ It's my gift! Updating receivedGifts...");
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
            } else {
              return prev.filter((g) => g.id !== updatedGift.id);
            }
          });
        }
      };

      socketService.connect(session?.user?.id);
      socketService.on("gift:updated", handleGiftUpdate);

      return () => {
        socketService.off("gift:updated", handleGiftUpdate);
      };
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        stickyHeaderIndices={[1]} // Le Ticker reste collé
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={THEME.textMain}
            colors={[THEME.textMain]}
            progressBackgroundColor={THEME.background}
          />
        }
      >
        {/* 1. HEADER JOURNAL */}
        <HeaderHome user={session?.user} />

        {/* 2. TICKER D'ACTUALITÉ */}
        <View style={styles.tickerContainer}>
          {session?.user?.emailVerified ? (
            <RadarTicker />
          ) : (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push("/(screens)/settingsScreen")}
              style={styles.verificationBanner}
            >
              <View style={styles.warningIcon}>
                <Ionicons name="alert" size={14} color="#FFF" />
              </View>
              <Text style={styles.verificationText}>
                VÉRIFICATION REQUISE : CONFIRMEZ VOTRE EMAIL
              </Text>
              <Ionicons name="arrow-forward" size={14} color={THEME.danger} />
            </TouchableOpacity>
          )}
        </View>

        {loading && !refreshing ? (
          <HomeSkeleton />
        ) : (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "timing", duration: 700 }}
          >
            {/* 3. CERCLE (Slider) */}
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
                <Text style={styles.sectionTitle}>
                  Dernières retrouvailles.
                </Text>
                <View style={styles.sectionDivider} />
              </View>

              {feedPosts.length > 0 ? (
                feedPosts.map((post) => (
                  <GiftCardHome key={post.id} item={post} />
                ))
              ) : (
                <View style={styles.emptyFeed}>
                  <View style={styles.iconCircle}>
                    <Ionicons
                      name="gift-outline"
                      size={28}
                      color={THEME.accent}
                    />
                  </View>
                  <Text style={styles.emptyFeedTitle}>
                    La page est blanche.
                  </Text>
                  <Text style={styles.emptyFeedText}>
                    Vos amis n&apos;ont pas encore partagé leurs envies. Soyez
                    le premier à inaugurer le registre.
                  </Text>
                </View>
              )}
            </View>
          </MotiView>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },

  /* TICKER & ALERTS */
  tickerContainer: {
    zIndex: 10,
    backgroundColor: THEME.background, // Pour cacher le scroll derrière
    paddingBottom: 10,
  },
  verificationBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(195, 74, 74, 0.08)", // Rouge brique très pâle
    marginHorizontal: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderLeftWidth: 3,
    borderLeftColor: THEME.danger,
    gap: 12,
  },
  warningIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: THEME.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  verificationText: {
    color: THEME.danger,
    fontSize: 10,
    fontWeight: "800",
    flex: 1,
    letterSpacing: 1,
  },

  /* SECTIONS */
  sectionContainer: {
    marginBottom: 40,
  },
  bannerWrapper: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },

  /* FEED */
  feedSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: "400",
    color: THEME.textMain,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    letterSpacing: -0.5,
  },
  sectionDivider: {
    width: 40,
    height: 2,
    backgroundColor: THEME.accent,
    marginTop: 15,
  },

  /* EMPTY STATE */
  emptyFeed: {
    paddingVertical: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(175, 144, 98, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyFeedTitle: {
    fontSize: 20,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    marginBottom: 10,
  },
  emptyFeedText: {
    color: THEME.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: "80%",
    fontStyle: "italic",
  },
});
