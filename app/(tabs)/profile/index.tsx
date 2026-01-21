import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState, useCallback, useMemo } from "react";
import { wishlistService } from "@/lib/services/wishlist-service";
import { giftService } from "@/lib/services/gift-service";
import GiftWishlistCard from "@/components/ProfilUI/GiftCard";
import ReservedGiftItem from "@/components/ProfilUI/ReservedGiftItem";
import {
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import PagerView from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authClient } from "@/lib/auth/auth-client";
import StatsMinimalistes from "@/components/ProfilUI/StatsMinimalistes";
import ProfilCard from "@/components/ProfilUI/ProfilCard";
import EmptyListTab from "@/components/ProfilUI/ui/EmptyListTab";
import LayoutPagerView from "@/components/layoutPagerView";
import HeaderParallax from "@/components/ProfilUI/HeaderParallax";
import * as ImagePicker from "expo-image-picker";
import { uploadService } from "@/lib/services/upload-service";
import { userService } from "@/lib/services/user-service";
import TopBarSettingQr from "@/components/ProfilUI/TopBarSettingQr";
import { HEADER_HEIGHT, TABS } from "@/constants/const";
import {
  ProfileHeaderSkeleton,
  WishlistCardSkeleton,
} from "@/components/ui/SkeletonGroup";

export default function ModernUserProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activePage, setActivePage] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Récupération de la session réelle
  const { data: session, refetch } = authClient.useSession();
  const user = session?.user;

  // États pour les données réelles
  const [userWishlists, setUserWishlists] = useState<any[]>([]);
  const [reservedGifts, setReservedGifts] = useState<any[]>([]);
  const [purchasedGifts, setPurchasedGifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfileData = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    const [wlRes, feedRes] = await Promise.all([
      wishlistService.getMyWishlists(),
      giftService.getFeed(), // Pour l'instant on prend du feed ou on pourrait avoir une route /me/gifts
    ]);

    if (wlRes.success) setUserWishlists(wlRes.wishlists);
    // Filtrer les cadeaux réservés/offerts par l'utilisateur (sera amélioré avec une route dédiée)
    if (feedRes.success) {
      // En attendant une route dédiée /users/me/activities
      setReservedGifts([]);
      setPurchasedGifts([]);
    }
    setLoading(false);
  }, [session]);

  // Actualisation quand l'utilisateur revient sur son profil
  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [loadProfileData]),
  );

  const wishesMapped = useMemo(() => {
    return userWishlists.map((wl) => ({
      wishlistId: wl.id,
      wishlistTitle: wl.title,
      totalGifts: wl._count?.gifts || 0,
      wishlistVisibility: wl.visibility,
      images: wl.gifts?.map((g: any) => g.imageUrl).filter(Boolean) || [],
    }));
  }, [userWishlists]);

  const handleSettingsPress = () => {
    router.push("../../(screens)/settingsScreen");
  };

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.15, 1],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - 120],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // --- HANDLERS ---
  const handleTabPress = (index: number) => {
    setActivePage(index);
    pagerRef.current?.setPage(index);
  };

  const handleEditAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      setLoading(true);
      try {
        const imageUrl = await uploadService.uploadImage(
          result.assets[0].uri,
          "profiles",
        );
        if (imageUrl) {
          const updateRes = await userService.updateProfile({
            avatarUrl: imageUrl,
          });
          if (updateRes.success) {
            await refetch(); // Forcer le rafraîchissement de la session Better Auth
            loadProfileData(); // Recharger les données
          } else {
            alert("Erreur lors de la mise à jour du profil");
          }
        }
      } catch (error) {
        console.error("Avatar upload error:", error);
        alert("Erreur lors de l'upload");
      } finally {
        setLoading(false);
      }
    }
  };

  const onPageSelected = (e: any) => {
    setActivePage(e.nativeEvent.position);
  };

  // --- RENDERERS ---
  const renderTab = (
    label: string,
    icon: keyof typeof Ionicons.glyphMap,
    index: number,
  ) => {
    const isActive = activePage === index;
    return (
      <TouchableOpacity
        onPress={() => handleTabPress(index)}
        style={[styles.tabItem, isActive && styles.tabItemActive]}
        activeOpacity={0.8}
      >
        <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 1. HEADER PARALLAX (Cover Artistique) */}
      <HeaderParallax
        user={user}
        headerOpacity={headerOpacity}
        imageScale={imageScale}
      />
      {/* 2. TOP BAR */}
      <View style={[styles.navBar, { top: insets.top }]}>
        <View />
        <TopBarSettingQr handleSettingsPress={handleSettingsPress} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 140 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      >
        {/* 3. PROFILE CARD (Overlap & Luxe) */}
        <View style={styles.profileCard}>
          {loading ? (
            <ProfileHeaderSkeleton />
          ) : (
            <>
              <ProfilCard user={user} onEditAvatar={handleEditAvatar} />

              {/* Stats Minimalistes */}
              <StatsMinimalistes
                userWishlists={userWishlists}
                reservedGifts={reservedGifts}
                purchasedGifts={purchasedGifts}
              />
            </>
          )}
        </View>

        {/* 4. TABS FLOTTANTS (Style Menu) */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabsInner}>
            {renderTab("À Offrir", "star", TABS.RESERVED)}
            {renderTab("Mes Listes", "gift", TABS.WISHES)}
            {renderTab("Historique", "time", TABS.BOUGHT)}
          </View>
        </View>

        {loading && (
          <View style={styles.gridContainer}>
            <View style={{ marginBottom: 16 }}>
              <WishlistCardSkeleton />
            </View>
            <View style={{ marginBottom: 16 }}>
              <WishlistCardSkeleton />
            </View>
          </View>
        )}

        {/* 5. CONTENT AREA */}
        <View style={{ minHeight: 600 }}>
          <PagerView
            ref={pagerRef}
            style={styles.pagerView}
            initialPage={0}
            onPageSelected={onPageSelected}
          >
            {/* PAGE 1: RESERVED */}
            <LayoutPagerView pageNumber={1}>
              {reservedGifts.length > 0 ? (
                reservedGifts.map((gift) => (
                  <View key={gift.id} style={{ marginBottom: 20 }}>
                    <ReservedGiftItem
                      gift={gift}
                      ownerName={gift.wishlist?.user?.name || "Inconnu"}
                      onPurchased={() => {}}
                      eventDate={gift.wishlist?.eventDate}
                    />
                  </View>
                ))
              ) : (
                <EmptyListTab
                  title="Aucune réservation active."
                  icon="gift-outline"
                />
              )}
            </LayoutPagerView>

            {/* PAGE 2: WISHES */}
            <LayoutPagerView pageNumber={2}>
              <View style={styles.gridContainer}>
                {wishesMapped.map((wishlist: any) => (
                  <View key={wishlist.wishlistId} style={{ marginBottom: 16 }}>
                    <GiftWishlistCard {...wishlist} />
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={styles.addListBtn}
                onPress={() => router.push("/(screens)/createEventScreen")}
              >
                <Ionicons name="add" size={24} color="#111827" />
                <Text style={styles.addListText}>Nouvelle collection</Text>
              </TouchableOpacity>
            </LayoutPagerView>

            {/* PAGE 3: BOUGHT */}
            <LayoutPagerView pageNumber={3}>
              {purchasedGifts.length > 0 ? (
                purchasedGifts.map((gift) => (
                  <View key={gift.id} style={{ marginBottom: 16 }}>
                    <ReservedGiftItem
                      gift={gift}
                      ownerName={gift.wishlist?.user?.name || "Inconnu"}
                      onPurchased={() => {}}
                      eventDate={gift.wishlist?.eventDate}
                    />
                  </View>
                ))
              ) : (
                <EmptyListTab
                  title="Aucune collection achetée."
                  icon="receipt-outline"
                />
              )}
            </LayoutPagerView>
          </PagerView>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* --- NAV BAR --- */
  navBar: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 12,
    zIndex: 10,
  },

  /* --- PROFILE CARD --- */
  profileCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 32,
    padding: 24,
    marginBottom: 32,
    // Ombre diffuse
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 6,
  },
  /* --- TABS --- */
  tabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  tabsInner: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 20,
  },
  tabItemActive: {
    backgroundColor: "#111827",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },

  /* --- CONTENT --- */
  pagerView: {
    flex: 1,
  },

  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 5,
  },

  /* Add List Button (Elegant Outline) */
  addListBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 16,
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  addListText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    letterSpacing: 0.5,
  },
});
