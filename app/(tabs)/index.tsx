import CreateWishlistBanner from "@/components/HomeUI/CreateWishlistBanner";
import FriendsWishlistSlider from "@/components/HomeUI/FriendsWishlistSlider";
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

import { Skeleton } from "@/components/ui/Skeleton";
import { GiftCardSkeleton } from "@/components/ui/SkeletonGroup";
import { socketService } from "@/lib/services/socket";

// Structure globale du chargement
const HomeSkeleton = () => (
  <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
    {/* Mock du Slider ou Bannière */}
    <Skeleton
      width="100%"
      height={200}
      borderRadius={24}
      style={{ marginBottom: 40 }}
    />

    {/* Titre Section */}
    <Skeleton
      width={200}
      height={24}
      borderRadius={4}
      style={{ marginBottom: 24 }}
    />

    {/* Cartes */}
    <GiftCardSkeleton />
  </View>
);

// --- ECRAN PRINCIPAL ---

export default function LuxuryFeedScreen() {
  const [inspirations, setInspirations] = useState<any[]>([]);
  const [circles, setCircles] = useState<any[]>([]);
  const [myWishlists, setMyWishlists] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { data: session } = authClient.useSession();

  const loadFeed = useCallback(async (isRefetching = false) => {
    try {
      if (!isRefetching) setLoading(true);
      const data = await giftService.getFeed();
      if (data.success) {
        setInspirations(data.inspirations);
        setCircles(data.circles);
      }
    } catch (error) {
      console.error("Failed to load feed:", error);
    } finally {
      if (!isRefetching) setLoading(false);
    }
  }, []);

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

  // Actualisation quand l'écran revient au premier plan
  useFocusEffect(
    useCallback(() => {
      loadFeed();
      loadMyWishlists();

      // Socket pour mises à jour temps réel
      const handleGiftUpdate = (updatedGift: any) => {
        setInspirations((prev) =>
          prev.map((item) => {
            if (item.id === updatedGift.id) {
              // On met à jour l'item tout en gardant les propriétés calculées si besoin,
              // mais ici updatedGift contient tout ce qu'il faut grâce au backend includes.
              // On doit juste s'assurer que la structure match.
              return { ...item, ...updatedGift };
            }
            return item;
          }),
        );
      };

      socketService.connect();
      socketService.on("gift:updated", handleGiftUpdate);

      return () => {
        socketService.off("gift:updated", handleGiftUpdate);
      };
    }, [loadFeed, loadMyWishlists]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadFeed(true), loadMyWishlists()]);
    setRefreshing(false);
  }, [loadFeed, loadMyWishlists]);

  const feedPosts = useMemo(() => {
    return inspirations.map((gift) => ({
      id: gift.id,
      user: {
        name: gift.wishlist?.user?.name ?? "Inconnu",
        avatar: gift.wishlist?.user?.image ?? "https://i.pravatar.cc/150",
      },
      product: {
        name: gift.title,
        image: gift.imageUrl,
        price: gift.estimatedPrice || 0,
      },
      wishlistId: gift.wishlistId,
      context: gift.wishlist?.title || "Liste perso",
      status: gift.status,
      isReserved: gift.status === "RESERVED",
      isPurchased: gift.status === "PURCHASED",
      reservedBy: gift.reservedBy,
      purchasedBy: gift.purchasedBy,
      isMyReservation: gift.reservedById === session?.user?.id,
      isMyPurchase: gift.purchasedById === session?.user?.id,
    }));
  }, [inspirations, session?.user?.id]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDFBF7" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        stickyHeaderIndices={[1]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#111827"
            colors={["#111827"]}
            progressBackgroundColor="#FFFFFF"
          />
        }
      >
        <HeaderHome user={session?.user} />

        <View style={{ zIndex: 10 }}>
          {session?.user?.emailVerified ? (
            <RadarTicker />
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/(screens)/settingsScreen")}
              style={styles.verificationNotice}
            >
              <Ionicons name="mail-unread-outline" size={20} color="#FFFFFF" />
              <Text style={styles.verificationNoticeText}>
                Veuillez confirmer votre email pour sécuriser votre compte
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* --- ETAT DE CHARGEMENT INITIAL (SKELETON) --- */}
        {loading && !refreshing ? (
          <HomeSkeleton />
        ) : (
          <>
            {/* CONTENU CHARGÉ */}

            {/* 1. Cercle Proche (Amis/Listes partagées) */}
            {circles.length > 0 && (
              <FriendsWishlistSlider wishlists={circles} />
            )}

            {/* 2. Bannière de création (si aucune liste perso) */}
            {myWishlists.length === 0 && (
              <CreateWishlistBanner
                onPress={() => router.push("/(screens)/createEventScreen")}
              />
            )}

            {/* 3. Fil d'Inspirations (Public et Amis) */}
            <View style={styles.feedSection}>
              <Text style={styles.sectionTitle}>Inspirations du moment</Text>

              {feedPosts.length > 0 ? (
                feedPosts.map((post) => (
                  <GiftCardHome key={post.id} item={post} />
                ))
              ) : (
                <View style={styles.emptyFeed}>
                  <Ionicons name="gift-outline" size={48} color="#D1D5DB" />
                  <Text style={styles.emptyFeedText}>
                    Aucune inspiration pour le moment.
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

// --- STYLES ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFBF7",
  },
  feedSection: {
    paddingHorizontal: 20,
  },
  verificationNotice: {
    backgroundColor: "#111827",
    marginHorizontal: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  verificationNoticeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 20,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  /* STYLE SKELETON CARD (Copie de GiftCardHome structure) */
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
  },
  emptyFeed: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  emptyFeedText: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "500",
  },
});
