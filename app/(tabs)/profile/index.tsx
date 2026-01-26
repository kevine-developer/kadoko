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
import { ThemedText } from "@/components/themed-text";
import Icon from "@/components/themed-icon";
import { useAppTheme } from "@/hooks/custom/use-app-theme";

export default function ModernUserProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

const theme = useAppTheme();

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await giftService.releaseGift(giftId);
      loadProfileData();
    } catch {
      showErrorToast("Erreur lors de la libération");
    }
  };

  const handleMarkAsPurchased = async (giftId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await giftService.purchaseGift(giftId);
      loadProfileData();
    } catch {
      showErrorToast("Erreur lors de la confirmation");
    }
  };

  const handleTabPress = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />

      <HeaderParallax
        user={user}
        headerOpacity={headerOpacity}
        imageScale={new Animated.Value(1)}
      />

      <View style={[styles.navBar, { top: insets.top + 10 }]}>
        <View />
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
        contentContainerStyle={{ paddingTop: 80 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      >
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
                  style={[styles.alertBanner, { borderLeftColor: theme.accent }]}
                  onPress={() => router.push("/(screens)/usernameSetupScreen")}
                >
                  <Icon name="at-outline" size={16} color={theme.accent} />
                  <ThemedText type="label" style={[styles.alertText]}>
                    Ajoutez un pseudo pour commencer
                  </ThemedText>
                  <Icon name="chevron-forward" size={14} color={theme.accent} />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* TABS ÉDITORIAUX */}
        <View style={styles.tabsWrapper}>
          <View style={[styles.tabsHeader, { borderBottomColor: theme.border }]}>
            {["À OFFRIR", "COLLECTIONS", "HISTORIQUE"].map((label, index) => {
              const isActive = activePage === index;
              return (
                <TouchableOpacity
                  key={label}
                  onPress={() => handleTabPress(index)}
                  style={[
                    styles.tabItem,
                    isActive && {
                      borderBottomColor: theme.textMain,
                      borderBottomWidth: 2,
                    },
                  ]}
                >
                  <ThemedText
                    type="label"
                    style={{ color: isActive ? theme.textMain : theme.textSecondary }}
                  >
                    {label}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ minHeight: 600 }}>
          <PagerView
            ref={pagerRef}
            style={{ flex: 1 }}
            initialPage={0}
            onPageSelected={(e) => setActivePage(e.nativeEvent.position)}
          >
            {/* RÉSERVATIONS */}
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
                    title="Le registre est vide."
                    icon="gift-outline"
                  />
                )}
              </View>
            </LayoutPagerView>

            {/* COLLECTIONS */}
            <LayoutPagerView pageNumber={2}>
              <View style={styles.gridContainer}>
                {wishesMapped.map((wishlist: any) => (
                  <GiftWishlistCard key={wishlist.wishlistId} {...wishlist} />
                ))}
              </View>
              <TouchableOpacity
                style={[styles.addBtnRegistry, { borderColor: theme.border }]}
                onPress={() => router.push("/(screens)/createEventScreen")}
              >
                <Icon name="add" />
                <ThemedText type="label" style={[styles.addBtnText]}>
                  NOUVELLE COLLECTION
                </ThemedText>
              </TouchableOpacity>
            </LayoutPagerView>

            {/* HISTORIQUE */}
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
                    title="Aucune attention passée."
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
  container: { flex: 1 },
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
  profileContent: { paddingHorizontal: 22, paddingTop: 20 },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(175, 144, 98, 0.05)",
    padding: 12,
    borderLeftWidth: 2,
    marginTop: 25,
  },
  alertText: {
    flex: 1,
    marginLeft: 10,
  },
  tabsWrapper: { paddingHorizontal: 22, marginBottom: 30 },
  tabsHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tabItem: { flex: 1, paddingVertical: 18, alignItems: "center" },
  listContainer: { paddingHorizontal: 22 },
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
    marginHorizontal: 22,
    borderWidth: 1,
    borderStyle: "dashed",
    marginTop: 25,
  },
  addBtnText: {
    marginLeft: 10,
  },
});
