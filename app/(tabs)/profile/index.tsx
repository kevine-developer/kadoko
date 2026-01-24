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
import * as Haptics from "expo-haptics";
import PagerView from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authClient } from "@/features/auth";
import StatsMinimalistes from "@/components/ProfilUI/StatsMinimalistes";
import ProfilCard from "@/components/ProfilUI/ProfilCard";
import EmptyListTab from "@/components/ProfilUI/ui/EmptyListTab";
import LayoutPagerView from "@/components/layoutPagerView";
import HeaderParallax from "@/components/ProfilUI/HeaderParallax";
import * as ImagePicker from "expo-image-picker";
import { uploadService } from "@/lib/services/upload-service";
import { userService } from "@/lib/services/user-service";
import TopBarSettingQr from "@/components/ProfilUI/TopBarSettingQr";
import { showErrorToast } from "@/lib/toast";
import { ProfileHeaderSkeleton } from "@/components/ui/SkeletonGroup";

// --- THEME ÉDITORIAL COHÉRENT ---
const THEME = {
  background: "#FDFBF7", // Bone Silk
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.08)",
};

export default function ModernUserProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activePage, setActivePage] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  const { data: session, refetch } = authClient.useSession();
  const user = session?.user as any;

  const [userWishlists, setUserWishlists] = useState<any[]>([]);
  const [reservedGifts, setReservedGifts] = useState<any[]>([]);
  const [purchasedGifts, setPurchasedGifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfileData = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const [wlRes, resRes] = await Promise.all([
        wishlistService.getMyWishlists(),
        giftService.getMyReservations(),
      ]);

      if (wlRes.success) setUserWishlists(wlRes.wishlists);
      if (resRes.success) {
        setPurchasedGifts(
          resRes.gifts.filter((g: any) => g.status === "PURCHASED"),
        );
        setReservedGifts(
          resRes.gifts.filter((g: any) => g.status === "RESERVED"),
        );
      }
    } finally {
      setLoading(false);
    }
  }, [session]);

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
      coverUrl: wl.coverUrl,
    }));
  }, [userWishlists]);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const handleUnreserve = async (giftId: string) => {
    const previous = [...reservedGifts];
    setReservedGifts((prev) => prev.filter((g) => g.id !== giftId));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const res = await giftService.releaseGift(giftId);
      if (!res.success) setReservedGifts(previous);
      loadProfileData();
    } catch {
      setReservedGifts(previous);
    }
  };

  const handleMarkAsPurchased = async (giftId: string) => {
    const previousReserved = [...reservedGifts];
    const previousPurchased = [...purchasedGifts];
    const gift = reservedGifts.find((g) => g.id === giftId);

    if (gift) {
      setReservedGifts((prev) => prev.filter((g) => g.id !== giftId));
      setPurchasedGifts((prev) => [{ ...gift, status: "PURCHASED" }, ...prev]);
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const res = await giftService.purchaseGift(giftId);
      if (!res.success) {
        setReservedGifts(previousReserved);
        setPurchasedGifts(previousPurchased);
      }
      loadProfileData();
    } catch {
      setReservedGifts(previousReserved);
      setPurchasedGifts(previousPurchased);
    }
  };

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
            await refetch();
            loadProfileData();
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* 1. HEADER PARALLAX ARTISTIQUE */}
      <HeaderParallax
        user={user}
        headerOpacity={headerOpacity}
        imageScale={new Animated.Value(1)} // Scale statique pour plus de sobriété
      />

      {/* 2. TOP BAR MINIMALISTE */}
      <View style={[styles.navBar, { top: insets.top + 10 }]}>
        <View style={{ flexDirection: "row" }} />
        <TopBarSettingQr
          handleSettingsPress={() => router.push("/(screens)/settingsScreen")}
          onQrPress={() => {
            if (!user?.username) {
              showErrorToast("Pseudo requis.");
              router.push("/(screens)/usernameSetupScreen");
            } else {
              router.push("/(screens)/shareProfileScreen");
            }
          }}
          showPremiumCard={() => router.push("/(screens)/premiumCardScreen")}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 100 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      >
        {/* 3. SECTION IDENTITÉ */}
        <View style={styles.profileContent}>
          {loading ? (
            <ProfileHeaderSkeleton />
          ) : (
            <>
              <ProfilCard user={user} onEditAvatar={handleEditAvatar} />

              <StatsMinimalistes
                userWishlists={userWishlists}
                reservedGifts={reservedGifts}
                purchasedGifts={purchasedGifts}
              />

              {!user?.username && (
                <TouchableOpacity
                  style={styles.alertBanner}
                  onPress={() => router.push("/(screens)/usernameSetupScreen")}
                >
                  <Ionicons name="at-outline" size={16} color={THEME.accent} />
                  <Text style={styles.alertText}>
                    Complétez votre signature numérique
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={14}
                    color={THEME.accent}
                  />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* 4. TABS NAVIGATION (Style Menu Boutique) */}
        <View style={styles.tabsWrapper}>
          <View style={styles.tabsHeader}>
            {["À OFFRIR", "COLLECTIONS", "HISTORIQUE"].map((label, index) => (
              <TouchableOpacity
                key={label}
                onPress={() => handleTabPress(index)}
                style={[
                  styles.tabItem,
                  activePage === index && styles.tabItemActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    activePage === index && styles.tabTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 5. ZONE DE CONTENU */}
        <View style={{ minHeight: 600 }}>
          <PagerView
            ref={pagerRef}
            style={{ flex: 1 }}
            initialPage={0}
            onPageSelected={(e) => setActivePage(e.nativeEvent.position)}
          >
            {/* RÉSERVATIONS (Registry Style) */}
            <LayoutPagerView pageNumber={1}>
              <View style={styles.listContainer}>
                {reservedGifts.length > 0 ? (
                  reservedGifts.map((gift) => (
                    <ReservedGiftItem
                      key={gift.id}
                      gift={gift}
                      ownerName={gift.wishlist?.user?.name}
                      onPurchased={() => handleMarkAsPurchased(gift.id)}
                      onUnreserve={() => handleUnreserve(gift.id)}
                    />
                  ))
                ) : (
                  <EmptyListTab
                    title="Votre registre de réservations est vide."
                    icon="gift-outline"
                  />
                )}
              </View>
            </LayoutPagerView>

            {/* WISHES (Grid Style) */}
            <LayoutPagerView pageNumber={2}>
              <View style={styles.gridContainer}>
                {wishesMapped.map((wishlist: any) => (
                  <GiftWishlistCard key={wishlist.wishlistId} {...wishlist} />
                ))}
              </View>
              <TouchableOpacity
                style={styles.addBtnRegistry}
                onPress={() => router.push("/(screens)/createEventScreen")}
              >
                <Ionicons name="add" size={20} color={THEME.textMain} />
                <Text style={styles.addBtnText}>NOUVELLE COLLECTION</Text>
              </TouchableOpacity>
            </LayoutPagerView>

            {/* BOUGHT (History Style) */}
            <LayoutPagerView pageNumber={3}>
              <View style={styles.listContainer}>
                {purchasedGifts.length > 0 ? (
                  purchasedGifts.map((gift) => (
                    <ReservedGiftItem
                      key={gift.id}
                      gift={gift}
                      ownerName={gift.wishlist?.user?.name}
                      isHistory
                    />
                  ))
                ) : (
                  <EmptyListTab
                    title="Aucune collection offerte pour le moment."
                    icon="receipt-outline"
                  />
                )}
              </View>
            </LayoutPagerView>
          </PagerView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  navBar: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: 25,
    zIndex: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  profileContent: { paddingHorizontal: 32, paddingTop: 40, marginBottom: 40 },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(175, 144, 98, 0.05)",
    padding: 12,
    borderLeftWidth: 2,
    borderLeftColor: THEME.accent,
    marginTop: 25,
  },
  alertText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "700",
    color: THEME.textMain,
    letterSpacing: 0.2,
    marginLeft: 10,
  },

  tabsWrapper: { paddingHorizontal: 32, marginBottom: 30 },
  tabsHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  tabItem: { flex: 1, paddingVertical: 18, alignItems: "center" },
  tabItemActive: { borderBottomWidth: 2, borderBottomColor: THEME.textMain },
  tabText: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1.5,
  },
  tabTextActive: { color: THEME.textMain },

  listContainer: { paddingHorizontal: 32 },
  gridContainer: {
    paddingHorizontal: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },

  addBtnRegistry: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    marginHorizontal: 32,
    borderWidth: 1,
    borderColor: THEME.border,
    borderStyle: "dashed",
    marginTop: 25,
  },
  addBtnText: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.textMain,
    letterSpacing: 1,
    marginLeft: 10,
  },
});
