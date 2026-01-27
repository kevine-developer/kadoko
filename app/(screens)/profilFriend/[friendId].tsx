import LayoutPagerView from "@/components/layoutPagerView";
import RenderTabButton from "@/components/Friends/friendProfil/renderTabButton";
import GiftWishlistCard from "@/components/ProfilUI/GiftCard";
import ReservedGiftItem from "@/components/ProfilUI/ReservedGiftItem";
import { userService } from "@/lib/services/user-service";
import { friendshipService } from "@/lib/services/friendship-service";
import { wishlistService } from "@/lib/services/wishlist-service";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import HeaderParallax from "@/components/ProfilUI/HeaderParallax";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";

const TABS = { WISHLISTS: 0, RESERVED: 1, ABOUT: 2 };

export default function FriendProfileScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const [activePage, setActivePage] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const { friendId } = useLocalSearchParams<{ friendId: string }>();

  const [friendInfo, setFriendInfo] = useState<any>(null);
  const [friendWishlists, setFriendWishlists] = useState<any[]>([]);
  const [reservedGifts, setReservedGifts] = useState<any[]>([]);
  const [friendshipStatus, setFriendshipStatus] = useState<any>({
    isFriend: false,
  });

  const loadProfileData = useCallback(async () => {
    try {
      const [userRes, wishlistsRes, friendshipsRes, reservationsRes] =
        await Promise.all([
          userService.getUserById(friendId),
          wishlistService.getUserWishlists(friendId),
          friendshipService.getMyFriendships(),
          friendshipService.getFriendReservations(friendId),
        ]);

      if (userRes.success) setFriendInfo(userRes.user);
      if (wishlistsRes.success) setFriendWishlists(wishlistsRes.wishlists);
      if (reservationsRes.success) setReservedGifts(reservationsRes.gifts);

      if (friendshipsRes.success) {
        const isFriendRes = friendshipsRes.friends.find(
          (f) => f.id === friendId,
        );
        const pendingSent = friendshipsRes.requestsSent.find(
          (r) => r.receiverId === friendId || r.id === friendId,
        );
        const pendingReceived = friendshipsRes.requestsReceived.find(
          (r) => r.id === friendId,
        );

        setFriendshipStatus({
          isFriend: !!isFriendRes,
          isPendingSent: !!pendingSent,
          isPendingReceived: !!pendingReceived,
          isFavorite: isFriendRes?.isFavorite || false,
          friendshipId:
            pendingSent?.friendshipId ||
            pendingReceived?.friendshipId ||
            isFriendRes?.friendshipId,
        });
      }
    } catch {
      // Data failure
    }
  }, [friendId]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const handleTabPress = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActivePage(index);
    pagerRef.current?.setPage(index);
  };

  const navigateToPrivateInfo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/profilFriend/friendPrivateInfoScreen",
      params: { friendId: friendId },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />

      <HeaderParallax
        user={friendInfo}
        headerOpacity={headerOpacity}
        imageScale={new Animated.Value(1)}
      />

      <View style={[styles.navBar, { top: insets.top + 10 }]}>
        <TouchableOpacity
          style={[
            styles.iconBtn,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
          onPress={() => router.back()}
        >
          <ThemedIcon name="chevron-back" size={24} colorName="textMain" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.iconBtn,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <ThemedIcon
            name="ellipsis-horizontal"
            size={20}
            colorName="textMain"
          />
        </TouchableOpacity>
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
        <View style={styles.profileSection}>
          <View style={styles.avatarRow}>
            <Image
              source={{ uri: friendInfo?.image || "https://i.pravatar.cc/150" }}
              style={[styles.avatar, { borderColor: theme.border }]}
            />
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <ThemedText type="defaultBold" style={styles.statNum}>
                  {friendWishlists.length}
                </ThemedText>
                <ThemedText
                  type="label"
                  colorName="textSecondary"
                  style={styles.statLab}
                >
                  LISTES
                </ThemedText>
              </View>
              <View
                style={[styles.statDivider, { backgroundColor: theme.border }]}
              />
              <View style={styles.statItem}>
                <ThemedText type="defaultBold" style={styles.statNum}>
                  {friendInfo?.friendsCount ?? 0}
                </ThemedText>
                <ThemedText
                  type="label"
                  colorName="textSecondary"
                  style={styles.statLab}
                >
                  CERCLE
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.identity}>
            <ThemedText type="hero" style={styles.name}>
              {friendInfo?.name}
            </ThemedText>
            <ThemedText type="label" colorName="accent" style={styles.handle}>
              @{friendInfo?.username || "membre"}
            </ThemedText>
            <ThemedText
              type="default"
              colorName="textSecondary"
              style={styles.bio}
            >
              {friendInfo?.description ||
                "Passionné par les attentions qui font sens."}
            </ThemedText>
          </View>

          <View style={styles.actionRow}>
            {friendshipStatus.isFriend ? (
              <TouchableOpacity
                style={[styles.secondaryBtn, { borderColor: theme.textMain }]}
                onPress={async () => {
                  const prev = { ...friendshipStatus };
                  setFriendshipStatus({ ...prev, isFriend: false });
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  try {
                    const res = await friendshipService.removeFriendship(
                      friendshipStatus.friendshipId,
                    );
                    if (!res.success) setFriendshipStatus(prev);
                    loadProfileData();
                  } catch {
                    setFriendshipStatus(prev);
                  }
                }}
              >
                <ThemedText
                  type="label"
                  colorName="textMain"
                  style={styles.secondaryBtnText}
                >
                  MEMBRE DU CERCLE
                </ThemedText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: theme.textMain }]}
                onPress={async () => {
                  const prev = { ...friendshipStatus };
                  setFriendshipStatus({ ...prev, isPendingSent: true });
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  try {
                    const res = await friendshipService.sendRequest(friendId);
                    if (!res.success) setFriendshipStatus(prev);
                    loadProfileData();
                  } catch {
                    setFriendshipStatus(prev);
                  }
                }}
              >
                <ThemedText
                  type="label"
                  style={[styles.primaryBtnText, { color: theme.background }]}
                >
                  {friendshipStatus.isPendingSent
                    ? "DEMANDE ENVOYÉE"
                    : "REJOINDRE LE CERCLE"}
                </ThemedText>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.iconActionBtn, { borderColor: theme.border }]}
            >
              <ThemedIcon
                name="chatbubble-outline"
                size={20}
                colorName="textMain"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabsWrapper}>
          <View
            style={[styles.tabsHeader, { borderBottomColor: theme.border }]}
          >
            <RenderTabButton
              label="SES LISTES"
              index={TABS.WISHLISTS}
              activePage={activePage}
              handleTabPress={handleTabPress}
            />
            <RenderTabButton
              label="RÉSERVATIONS"
              index={TABS.RESERVED}
              activePage={activePage}
              handleTabPress={handleTabPress}
            />
            <RenderTabButton
              label="DÉTAILS"
              index={TABS.ABOUT}
              activePage={activePage}
              handleTabPress={handleTabPress}
            />
          </View>
        </View>

        <View style={{ minHeight: 500 }}>
          <PagerView
            ref={pagerRef}
            style={{ flex: 1 }}
            initialPage={0}
            onPageSelected={(e) => setActivePage(e.nativeEvent.position)}
          >
            <LayoutPagerView pageNumber={0}>
              <View style={styles.contentGrid}>
                {friendWishlists.map((wl) => (
                  <GiftWishlistCard
                    key={wl.id}
                    wishlistId={wl.id}
                    wishlistTitle={wl.title}
                    totalGifts={wl._count?.gifts || 0}
                    wishlistVisibility={wl.visibility}
                    images={[]}
                  />
                ))}
              </View>
            </LayoutPagerView>

            <LayoutPagerView pageNumber={1}>
              <View style={styles.registryList}>
                <View style={styles.secretBanner}>
                  <ThemedIcon name="lock-closed" size={12} colorName="accent" />
                  <ThemedText
                    type="label"
                    colorName="textMain"
                    style={styles.secretText}
                  >
                    REGISTRE PRIVÉ — SEUL VOUS POUVEZ VOIR CECI
                  </ThemedText>
                </View>
                {reservedGifts.map((gift) => (
                  <ReservedGiftItem
                    key={gift.id}
                    gift={gift}
                    ownerName={friendInfo?.name}
                    onPurchased={loadProfileData}
                  />
                ))}
              </View>
            </LayoutPagerView>

            <LayoutPagerView pageNumber={2}>
              <View style={styles.registryList}>
                <View
                  style={[styles.infoLine, { borderBottomColor: theme.border }]}
                >
                  <ThemedText
                    type="label"
                    colorName="textSecondary"
                    style={styles.infoLabel}
                  >
                    MEMBRE DEPUIS
                  </ThemedText>
                  <ThemedText type="defaultBold" style={styles.infoValue}>
                    2024
                  </ThemedText>
                </View>
                <View
                  style={[styles.infoLine, { borderBottomColor: theme.border }]}
                >
                  <ThemedText
                    type="label"
                    colorName="textSecondary"
                    style={styles.infoLabel}
                  >
                    ANNIVERSAIRE
                  </ThemedText>
                  <ThemedText type="defaultBold" style={styles.infoValue}>
                    {friendInfo?.birthday
                      ? new Date(friendInfo.birthday).toLocaleDateString(
                          "fr-FR",
                          { day: "numeric", month: "long" },
                        )
                      : "NON RENSEIGNÉ"}
                  </ThemedText>
                </View>
                {friendshipStatus.isFriend && (
                  <TouchableOpacity
                    style={[
                      styles.prefLink,
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                      },
                    ]}
                    onPress={navigateToPrivateInfo}
                  >
                    <ThemedIcon
                      name="heart-outline"
                      size={18}
                      colorName="accent"
                    />
                    <View style={{ flex: 1, marginLeft: 15 }}>
                      <ThemedText type="label" style={styles.prefTitle}>
                        PRÉFÉRENCES PERSONNELLES
                      </ThemedText>
                      <ThemedText
                        type="caption"
                        colorName="textSecondary"
                        style={styles.prefSub}
                      >
                        Tailles, goûts et modalités de livraison
                      </ThemedText>
                    </View>
                    <ThemedIcon
                      name="chevron-forward"
                      size={14}
                      colorName="border"
                    />
                  </TouchableOpacity>
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
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 20,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  profileSection: { paddingHorizontal: 32, paddingTop: 40, marginBottom: 40 },
  avatarRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 25 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 0,
    backgroundColor: "#F2F2F7",
    borderWidth: 1,
  },
  statsContainer: {
    flex: 1,
    flexDirection: "row",
    marginLeft: 25,
    paddingBottom: 10,
  },
  statItem: { flex: 1, alignItems: "center" },
  statNum: {
    fontSize: 18,
  },
  statLab: {
    letterSpacing: 1,
    marginTop: 4,
  },
  statDivider: { width: 1, height: 20 },
  identity: { marginBottom: 30 },
  name: {
    letterSpacing: -1,
  },
  handle: {
    letterSpacing: 0.5,
    marginTop: 4,
  },
  bio: {
    marginTop: 12,
  },
  actionRow: { flexDirection: "row", gap: 12 },
  primaryBtn: {
    flex: 1,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryBtnText: {
    letterSpacing: 1,
  },
  secondaryBtn: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryBtnText: {
    letterSpacing: 1,
  },
  iconActionBtn: {
    width: 50,
    height: 50,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabsWrapper: { paddingHorizontal: 32, marginBottom: 25 },
  tabsHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  contentGrid: {
    paddingHorizontal: 25,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  registryList: { paddingHorizontal: 32 },
  secretBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
    opacity: 0.6,
  },
  secretText: {
    letterSpacing: 1,
  },
  infoLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  infoLabel: {
    letterSpacing: 1.5,
  },
  infoValue: { fontWeight: "600" },
  prefLink: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 25,
    padding: 20,
    borderWidth: 1,
  },
  prefTitle: {
    letterSpacing: 1,
  },
  prefSub: { marginTop: 2 },
});
