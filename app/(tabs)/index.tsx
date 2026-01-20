import CreateWishlistBanner from "@/components/HomeUI/CreateWishlistBanner";
import FriendsWishlistSlider from "@/components/HomeUI/FriendsWishlistSlider";
import GiftCardHome from "@/components/HomeUI/GiftCardHome";
import HeaderHome from "@/components/HomeUI/HeaderHome";
import RadarTicker from "@/components/HomeUI/RadarTicker";
import { authClient } from "@/lib/auth/auth-client";
import { giftService } from "@/lib/services/gift-service";
import { wishlistService } from "@/lib/services/wishlist-service";
import { router, useFocusEffect } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from "react-native";

// --- THEME ---
const THEME = {
  background: "#FDFBF7",
  skeleton: "#E5E7EB", // Gris doux pour le squelette
};

// --- COMPOSANT SKELETON (ANIMATION PULSE) ---
const SkeletonCard = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={[styles.cardContainer, { opacity, marginBottom: 32 }]}
    >
      {/* Header Skeleton */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          gap: 12,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: THEME.skeleton,
          }}
        />
        <View style={{ gap: 6 }}>
          <View
            style={{
              width: 120,
              height: 14,
              borderRadius: 4,
              backgroundColor: THEME.skeleton,
            }}
          />
          <View
            style={{
              width: 80,
              height: 10,
              borderRadius: 4,
              backgroundColor: THEME.skeleton,
            }}
          />
        </View>
      </View>

      {/* Image Skeleton */}
      <View
        style={{ height: 320, width: "100%", backgroundColor: THEME.skeleton }}
      />

      {/* Footer Skeleton */}
      <View style={{ padding: 20 }}>
        <View
          style={{
            width: "80%",
            height: 20,
            borderRadius: 4,
            backgroundColor: THEME.skeleton,
            marginBottom: 20,
          }}
        />
        <View
          style={{
            height: 50,
            borderRadius: 25,
            backgroundColor: THEME.skeleton,
          }}
        />
      </View>
    </Animated.View>
  );
};

// Structure globale du chargement
const HomeSkeleton = () => (
  <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
    {/* Mock du Slider ou Bannière */}
    <View
      style={{
        height: 200,
        backgroundColor: "#F3F4F6",
        borderRadius: 24,
        marginBottom: 40,
        opacity: 0.5,
      }}
    />

    {/* Titre Section */}
    <View
      style={{
        width: 200,
        height: 24,
        backgroundColor: "#E5E7EB",
        borderRadius: 4,
        marginBottom: 24,
      }}
    />

    {/* Cartes */}
    <SkeletonCard />
    <SkeletonCard />
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
          <RadarTicker />
        </View>

        {/* --- ETAT DE CHARGEMENT INITIAL (SKELETON) --- */}
        {loading && !refreshing ? (
          <HomeSkeleton />
        ) : (
          <>
            {/* CONTENU CHARGÉ */}
            {myWishlists.length > 0 ? (
              <FriendsWishlistSlider wishlists={circles} />
            ) : (
              <CreateWishlistBanner
                onPress={() => router.push("/(screens)/createEventScreen")}
              />
            )}

            <View style={styles.feedSection}>
              <Text style={styles.sectionTitle}>Inspirations du moment</Text>

              {feedPosts.map((post) => (
                <GiftCardHome key={post.id} item={post} />
              ))}
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
});
