import CreateWishlistBanner from "@/components/HomeUI/CreateWishlistBanner";
import GiftCardHome from "@/components/HomeUI/GiftCardHome";
import { router } from "expo-router";
import React, { useMemo, useEffect, useState, useCallback } from "react";
import { giftService } from "@/lib/services/gift-service";
import { wishlistService } from "@/lib/services/wishlist-service";
import { authClient } from "@/lib/auth/auth-client";
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import HeaderHome from "@/components/HomeUI/HeaderHome";
import FriendsWishlistSlider from "@/components/HomeUI/FriendsWishlistSlider";
import RadarTicker from "@/components/HomeUI/RadarTicker";

// --- ECRAN PRINCIPAL ---

export default function LuxuryFeedScreen() {
  const [inspirations, setInspirations] = useState<any[]>([]);
  const [circles, setCircles] = useState<any[]>([]);
  const [myWishlists, setMyWishlists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Vérifier si l'utilisateur est connecté pour l'affichage conditionnel
  const { data: session } = authClient.useSession();

  const loadFeed = useCallback(async () => {
    try {
      setLoading(true);
      const data = await giftService.getFeed();
      if (data.success) {
        setInspirations(data.inspirations);
        setCircles(data.circles);
      }
    } catch (error) {
      console.error("Failed to load feed:", error);
    } finally {
      setLoading(false);
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

  useEffect(() => {
    loadFeed();
    loadMyWishlists();
  }, [loadFeed, loadMyWishlists]);

  // Préparer le feed pour le composant (Inspirations)
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
      isReserved: gift.status !== "AVAILABLE",
    }));
  }, [inspirations]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDFBF7" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        stickyHeaderIndices={[1]}
      >
        <HeaderHome user={session?.user} />
        <View style={{ zIndex: 10 }}>
          <RadarTicker />
        </View>

        {/* LOGIQUE D'AFFICHAGE CONDITIONNEL */}
        {myWishlists.length > 0 ? (
          <FriendsWishlistSlider wishlists={circles} />
        ) : (
          <CreateWishlistBanner
            onPress={() => router.push("/(screens)/createEventScreen")}
          />
        )}

        <View style={styles.feedSection}>
          <Text style={styles.sectionTitle}>Inspirations du moment</Text>
          {loading && (
            <Text style={{ textAlign: "center", color: "#6B7280" }}>
              Chargement...
            </Text>
          )}
          {feedPosts.map((post) => (
            <GiftCardHome key={post.id} item={post} />
          ))}
        </View>
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

  /* FEED SECTION */
  feedSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 20,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
});
