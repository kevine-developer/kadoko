import LayoutPagerView from "@/components/layoutPagerView";
import RenderTabButton from "@/components/Friends/friendProfil/renderTabButton";
import GiftWishlistCard from "@/components/ProfilUI/GiftCard";
import ReservedGiftItem from "@/components/ProfilUI/ReservedGiftItem";
import { userService } from "@/lib/services/user-service";
import { wishlistService } from "@/lib/services/wishlist-service";
import { WishlistVisibility } from "@/types/gift";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState, useEffect } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// --- CONFIG TABS ---
const TABS = {
  WISHLISTS: 0,
  RESERVED_FOR_HIM: 1,
  ABOUT: 2,
};

export default function FriendProfileScreen() {
  const insets = useSafeAreaInsets();
  const [activePage, setActivePage] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const { friendId } = useLocalSearchParams<{ friendId: string }>();

  const [friendInfo, setFriendInfo] = useState<any>(null);
  const [friendWishlists, setFriendWishlists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      try {
        const [userRes, wishlistsRes] = await Promise.all([
          userService.getUserById(friendId),
          wishlistService.getUserWishlists(friendId),
        ]);

        if (userRes.success) {
          setFriendInfo(userRes.user);
        }
        if (wishlistsRes.success) {
          setFriendWishlists(wishlistsRes.wishlists);
        }
      } catch (error) {
        console.error("Error loading friend profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [friendId]);

  // Animation Header (Parallax & Blur simulation)
  const headerHeight = 320; // Plus grand pour l'effet dramatique
  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.15, 1],
    extrapolate: "clamp",
  });
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, headerHeight - 120],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const handleTabPress = (index: number) => {
    setActivePage(index);
    pagerRef.current?.setPage(index);
  };

  const onPageSelected = (e: any) => {
    setActivePage(e.nativeEvent.position);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 1. HEADER IMMERSIF (Cover + Avatar) */}
      <Animated.View
        style={[styles.headerContainer, { opacity: headerOpacity }]}
      >
        <Animated.Image
          source={{
            uri:
              friendInfo?.coverUrl ||
              "https://images.unsplash.com/photo-1557683311-eac922347aa1?w=800",
          }}
          style={[styles.headerImage, { transform: [{ scale: imageScale }] }]}
        />
        <View style={styles.headerOverlay} />
        {/* Dégradé subtil en bas du header pour fondre avec la carte */}
        <View style={styles.headerGradient} />
      </Animated.View>

      {/* 2. NAVIGATION BAR (Flottante) */}
      <View style={[styles.navBar, { top: insets.top }]}>
        <TouchableOpacity
          style={styles.iconButtonBlur}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButtonBlur}>
          <Ionicons name="ellipsis-horizontal" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 160 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        stickyHeaderIndices={[1]} // Tabs sticky si désiré (ici index 1 car ProfileCard est 0)
      >
        {/* 3. CARTE D'INFO PRINCIPALE (Luxe Style) */}
        <View style={styles.profileCard}>
          <View style={styles.cardHeaderRow}>
            {/* Avatar qui déborde */}
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: friendInfo?.image }}
                style={styles.avatar}
                contentFit="cover"
              />
              <View style={styles.onlineBadge} />
            </View>

            {/* Stats minimalistes */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{friendWishlists.length}</Text>
                <Text style={styles.statLabel}>Collections</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>-</Text>
                <Text style={styles.statLabel}>Amis</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.name}>{friendInfo?.name}</Text>
            <Text style={styles.username}>
              @{friendInfo?.username || friendInfo?.email?.split("@")[0]}
            </Text>
            <Text style={styles.bio}>
              {friendInfo?.description ||
                "Passionné de design et de belles choses."}
            </Text>
          </View>

          {/* 4. ACTION BUTTONS (Noirs & Élégants) */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Suivre</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>Message</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconActionBtn}>
              <Ionicons name="share-outline" size={20} color="#111827" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. TABS NAVIGATION */}
        <View style={styles.tabsWrapper}>
          <View style={styles.tabsContainer}>
            <RenderTabButton
              label="Listes"
              index={TABS.WISHLISTS}
              activePage={activePage}
              handleTabPress={handleTabPress}
            />
            <RenderTabButton
              label="Réservations"
              index={TABS.RESERVED_FOR_HIM}
              activePage={activePage}
              handleTabPress={handleTabPress}
            />
            <RenderTabButton
              label="À propos"
              index={TABS.ABOUT}
              activePage={activePage}
              handleTabPress={handleTabPress}
            />
          </View>
        </View>

        {/* 6. CONTENU (PAGER) */}
        <View style={{ minHeight: 600, backgroundColor: "#FDFBF7" }}>
          <PagerView
            ref={pagerRef}
            style={styles.pagerView}
            initialPage={0}
            onPageSelected={onPageSelected}
          >
            {/* PAGE 1 : SES WISHLISTS */}
            <LayoutPagerView pageNumber={0}>
              <View style={styles.contentGrid}>
                {friendWishlists.map((wishlist) => (
                  <View key={wishlist.id} style={{ marginBottom: 20 }}>
                    <GiftWishlistCard
                      wishlistId={wishlist.id}
                      wishlistTitle={wishlist.title}
                      totalGifts={wishlist._count?.gifts || 0}
                      wishlistVisibility={
                        wishlist.visibility as WishlistVisibility
                      }
                      images={[]} // Pas d'images pour le moment via cette route
                    />
                  </View>
                ))}
                {!loading && friendWishlists.length === 0 && (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>
                      Aucune collection publique.
                    </Text>
                  </View>
                )}
              </View>
            </LayoutPagerView>

            {/* PAGE 2 : CE QUE J'AI RÉSERVÉ */}
            <LayoutPagerView pageNumber={1}>
              <View style={styles.contentPadding}>
                <View style={styles.secretNote}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={16}
                    color="#111827"
                  />
                  <Text style={styles.secretText}>
                    Visible uniquement par vous.
                  </Text>
                </View>
                <ReservedGiftItem
                  gift={{
                    id: "1",
                    title: "Leica Q2 Monochrom",
                    imageUrl:
                      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
                    estimatedPrice: 5500,
                    priority: 5,
                    productUrl: "https://leica.com",
                  }}
                  ownerName={friendInfo?.name}
                  onPurchased={() => {}}
                  eventDate={new Date()}
                />
              </View>
            </LayoutPagerView>

            {/* PAGE 3 : ABOUT */}
            <LayoutPagerView pageNumber={2}>
              <View style={styles.contentPadding}>
                <View style={styles.aboutCard}>
                  <View style={styles.aboutRow}>
                    <Text style={styles.aboutLabel}>Membre depuis</Text>
                    <Text style={styles.aboutValue}>2024</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.aboutRow}>
                    <Text style={styles.aboutLabel}>Localisation</Text>
                    <Text style={styles.aboutValue}>Paris, 75003</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.aboutRow}>
                    <Text style={styles.aboutLabel}>Liens</Text>
                    <Text
                      style={[
                        styles.aboutValue,
                        { textDecorationLine: "underline" },
                      ]}
                    >
                      instagram.com
                    </Text>
                  </View>
                </View>
              </View>
            </LayoutPagerView>
          </PagerView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFBF7", // Blanc cassé "Bone"
  },

  /* --- HEADER --- */
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 240,
    zIndex: 0,
    backgroundColor: "#111827",
  },
  headerImage: {
    width: "100%",
    height: "100%",
    opacity: 0.8,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  headerGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    // Simulation gradient transparent -> couleur de fond
    // Sur web/expo on pourrait utiliser LinearGradient, ici simple overlay
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  navBar: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 12,
    zIndex: 100,
  },
  iconButtonBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(12px)", // Web only, ignoré sur natif
  },

  /* --- PROFILE CARD --- */
  profileCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 32,
    padding: 24,
    marginBottom: 24,
    // Ombre diffuse colorée (Luxe)
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 8,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  avatarWrapper: {
    marginTop: -60, // Sort de la carte
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    backgroundColor: "#F3F4F6",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 4,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#10B981",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  statsRow: {
    flexDirection: "row",
    gap: 20,
    paddingTop: 8,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  statLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  /* INFO TEXTS */
  infoSection: {
    marginBottom: 24,
    marginTop: 8,
  },
  name: {
    fontSize: 28,
    fontWeight: "500",
    color: "#111827",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  bio: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 24,
    fontWeight: "400",
  },

  /* ACTIONS */
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  primaryBtn: {
    flex: 2,
    backgroundColor: "#111827", // Noir profond
    height: 52,
    borderRadius: 26, // Pill shape total
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  secondaryBtn: {
    flex: 1.5,
    backgroundColor: "#FFFFFF",
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  secondaryBtnText: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 15,
  },
  iconActionBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
  },

  /* --- TABS --- */
  tabsWrapper: {
    backgroundColor: "#FDFBF7",
    zIndex: 10,
    paddingVertical: 10,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    gap: 32,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.03)",
    paddingBottom: 16,
  },

  /* --- CONTENT --- */
  pagerView: {
    flex: 1,
  },
  contentPadding: {
    paddingTop: 24,
  },
  contentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 5,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 40,
  },
  emptyText: {
    color: "#9CA3AF",
    fontStyle: "italic",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 16,
  },

  /* Secret Note */
  secretNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F3F4F6",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  secretText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },

  /* About Section */
  aboutCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
  },
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  aboutLabel: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
  },
  aboutValue: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
  },
});
