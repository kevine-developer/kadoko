import CreateWishlistBanner from "@/components/HomeUI/CreateWishlistBanner";
import GiftCardHome from "@/components/HomeUI/GiftCardHome";
import HeaderLive from "@/components/HomeUI/HeaderLive";
import { getPublishedGifts } from "@/lib/getPublishedGifts";
import { MOCK_USERS } from "@/mocks/users.mock";
import { MOCK_WISHLISTS } from "@/mocks/wishlists.mock";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Simulation de l'utilisateur connecté (ici Luna)
const CURRENT_USER_ID = "user-kevine";

// --- COMPOSANT: CARTE LISTE D'AMI (Slider Item) ---
const FriendWishlistCard = ({
  wishlist,
  owner,
}: {
  wishlist: any;
  owner: any;
}) => {
  // On prend la première image d'un cadeau de la liste comme cover, ou une placeholder
  const coverImage =
    wishlist.gifts.find((g: any) => g.imageUrl)?.imageUrl ||
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
        {/* Badge Date ou Event */}
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
          <Image source={{ uri: owner?.avatarUrl }} style={styles.miniAvatar} />
          <Text style={styles.friendName}>{owner?.fullName}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// --- COMPOSANT: SLIDER DES LISTES D'AMIS ---
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
        {wishlists.map((wl) => {
          const owner = MOCK_USERS.find((u) => u.id === wl.userId);
          return <FriendWishlistCard key={wl.id} wishlist={wl} owner={owner} />;
        })}
      </ScrollView>
    </View>
  );
};

// --- COMPOSANT: RADAR TICKER (Existant) ---
const UPDATES = [
  { id: 1, user: "Sophie", action: "a créé", target: "Déco Salon", time: "2h" },
  {
    id: 2,
    user: "Marc",
    action: "a ajouté",
    target: "Apple Watch",
    time: "4h",
  },
  {
    id: 3,
    user: "Léa",
    action: "fête son",
    target: "Anniversaire",
    time: "J-3",
    urgent: true,
  },
];

const RadarTicker = () => (
  <BlurView
    intensity={80}
    blurReductionFactor={1}
    style={styles.radarContainer}
  >
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.radarContent}
    >
      <View style={styles.radarLabelContainer}>
        <Ionicons name="flash" size={12} color="#FFFFFF" />
        <Text style={styles.radarLabel}>LIVE</Text>
      </View>
      {UPDATES.map((item, index) => (
        <View key={item.id} style={styles.radarItem}>
          <Text style={styles.radarText}>
            <Text style={styles.radarUser}>{item.user}</Text>
            <Text style={{ opacity: 0.6 }}> {item.action} </Text>
            <Text style={styles.radarTarget}>{item.target}</Text>
          </Text>
          {index !== UPDATES.length - 1 && (
            <View style={styles.radarSeparator} />
          )}
        </View>
      ))}
    </ScrollView>
  </BlurView>
);

// --- ECRAN PRINCIPAL ---

export default function LuxuryFeedScreen() {
  // 1. Vérifier si l'utilisateur courant a des wishlists
  const hasMyOwnWishlists = useMemo(() => {
    return MOCK_WISHLISTS.some((wl) => wl.userId === CURRENT_USER_ID);
  }, []);

  // 2. Récupérer les wishlists des amis (exclure celles de l'user courant)
  // Dans une vraie app, on filtrerait par la liste d'amis. Ici on prend tout ce qui n'est pas à moi.
  const friendsWishlists = useMemo(() => {
    return MOCK_WISHLISTS.filter((wl) => wl.userId !== CURRENT_USER_ID);
  }, []);

  // 3. Préparer le feed (inspirations)
  const feedPosts = useMemo(() => {
    const allGifts = MOCK_WISHLISTS.flatMap((wl) => wl.gifts);
    const publishedGifts = getPublishedGifts(allGifts);

    return publishedGifts.map((gift) => {
      const wishlist = MOCK_WISHLISTS.find((w) => w.id === gift.wishlistId);
      const owner = MOCK_USERS.find((u) => u.id === wishlist?.userId);

      return {
        id: gift.id,
        user: {
          name: owner?.fullName ?? "Inconnu",
          avatar: owner?.avatarUrl ?? "https://i.pravatar.cc/150",
        },
        product: {
          name: gift.title,
          image: gift.imageUrl,
          price: gift.estimatedPrice || 0,
        },
        wishlistId: gift.wishlistId,
        context: wishlist?.title || "Liste perso",
        isReserved: gift.status === "RESERVED" || gift.status === "PURCHASED",
      };
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDFBF7" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        stickyHeaderIndices={[1]}
      >
        <HeaderLive />

        <View style={{ zIndex: 10 }}>
          <RadarTicker />
        </View>

        {/* LOGIQUE D'AFFICHAGE CONDITIONNEL */}
        {hasMyOwnWishlists ? (
          // Si j'ai une liste -> Je vois les listes de mes amis
          <FriendsWishlistSlider wishlists={friendsWishlists} />
        ) : (
          // Sinon -> On m'incite à créer ma première liste
          <CreateWishlistBanner onPress={() => {}} />
        )}

        <View style={styles.feedSection}>
          <Text style={styles.sectionTitle}>Inspirations du moment</Text>
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

  /* RADAR */
  radarContainer: {
    marginBottom: 24,
    paddingTop: 20,
    overflow: "hidden",
  },
  radarContent: {
    paddingHorizontal: 24,
    alignItems: "center",
    paddingVertical: 10,
  },
  radarLabelContainer: {
    backgroundColor: "#111827",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 16,
    gap: 4,
  },
  radarLabel: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  radarItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  radarText: {
    fontSize: 14,
    color: "#374151",
  },
  radarUser: {
    fontWeight: "700",
    color: "#111827",
  },
  radarTarget: {
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  radarSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 12,
  },

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
