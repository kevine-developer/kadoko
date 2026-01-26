import LayoutPagerView from "@/components/layoutPagerView";
import RenderTabButton from "@/components/Friends/friendProfil/renderTabButton";
import GiftWishlistCard from "@/components/ProfilUI/GiftCard";
import ReservedGiftItem from "@/components/ProfilUI/ReservedGiftItem";
import { userService } from "@/lib/services/user-service";
import { friendshipService } from "@/lib/services/friendship-service";
import { wishlistService } from "@/lib/services/wishlist-service";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState, useEffect, useCallback } from "react";
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
import * as Haptics from "expo-haptics";
import HeaderParallax from "@/components/ProfilUI/HeaderParallax";

// --- THEME ÉDITORIAL COHÉRENT ---
const THEME = {
  background: "#FDFBF7",
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.08)",
};

const TABS = { WISHLISTS: 0, RESERVED: 1, ABOUT: 2 };

export default function FriendProfileScreen() {
  const insets = useSafeAreaInsets();
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* 1. HEADER PARALLAX ÉLÉGANT */}
      <HeaderParallax
        user={friendInfo}
        headerOpacity={headerOpacity}
        imageScale={new Animated.Value(1)}
      />

      {/* 2. TOP BAR */}
      <View style={[styles.navBar, { top: insets.top + 10 }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={THEME.textMain} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons
            name="ellipsis-horizontal"
            size={20}
            color={THEME.textMain}
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
        {/* 3. PROFILE SECTION */}
        <View style={styles.profileSection}>
          <View style={styles.avatarRow}>
            <Image source={{ uri: friendInfo?.image }} style={styles.avatar} />
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNum}>{friendWishlists.length}</Text>
                <Text style={styles.statLab}>LISTES</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNum}>
                  {friendInfo?.friendsCount ?? 0}
                </Text>
                <Text style={styles.statLab}>CERCLE</Text>
              </View>
            </View>
          </View>

          <View style={styles.identity}>
            <Text style={styles.name}>{friendInfo?.name}</Text>
            <Text style={styles.handle}>
              @{friendInfo?.username || "membre"}
            </Text>
            <Text style={styles.bio}>
              {friendInfo?.description ||
                "Passionné par les attentions qui font sens."}
            </Text>
          </View>

          {/* ACTIONS AUTHORITY */}
          <View style={styles.actionRow}>
            {friendshipStatus.isFriend ? (
              <TouchableOpacity
                style={styles.secondaryBtn}
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
                <Text style={styles.secondaryBtnText}>MEMBRE DU CERCLE</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.primaryBtn}
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
                <Text style={styles.primaryBtnText}>
                  {friendshipStatus.isPendingSent
                    ? "DEMANDE ENVOYÉE"
                    : "REJOINDRE LE CERCLE"}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.iconActionBtn}>
              <Ionicons
                name="chatbubble-outline"
                size={20}
                color={THEME.textMain}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. TABS STYLE MENU */}
        <View style={styles.tabsWrapper}>
          <View style={styles.tabsHeader}>
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

        {/* 5. CONTENU */}
        <View style={{ minHeight: 500 }}>
          <PagerView
            ref={pagerRef}
            style={{ flex: 1 }}
            initialPage={0}
            onPageSelected={(e) => setActivePage(e.nativeEvent.position)}
          >
            {/* WISHLISTS */}
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

            {/* RESERVED */}
            <LayoutPagerView pageNumber={1}>
              <View style={styles.registryList}>
                <View style={styles.secretBanner}>
                  <Ionicons name="lock-closed" size={12} color={THEME.accent} />
                  <Text style={styles.secretText}>
                    REGISTRE PRIVÉ — SEUL VOUS POUVEZ VOIR CECI
                  </Text>
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

            {/* ABOUT */}
            <LayoutPagerView pageNumber={2}>
              <View style={styles.registryList}>
                <View style={styles.infoLine}>
                  <Text style={styles.infoLabel}>MEMBRE DEPUIS</Text>
                  <Text style={styles.infoValue}>2024</Text>
                </View>
                <View style={styles.infoLine}>
                  <Text style={styles.infoLabel}>ANNIVERSAIRE</Text>
                  <Text style={styles.infoValue}>
                    {friendInfo?.birthday
                      ? new Date(friendInfo.birthday).toLocaleDateString(
                          "fr-FR",
                          { day: "numeric", month: "long" },
                        )
                      : "NON RENSEIGNÉ"}
                  </Text>
                </View>
                {friendshipStatus.isFriend && (
                  <TouchableOpacity
                    style={styles.prefLink}
                    onPress={navigateToPrivateInfo}
                  >
                    <Ionicons
                      name="heart-outline"
                      size={18}
                      color={THEME.accent}
                    />
                    <View style={{ flex: 1, marginLeft: 15 }}>
                      <Text style={styles.prefTitle}>
                        PRÉFÉRENCES PERSONNELLES
                      </Text>
                      <Text style={styles.prefSub}>
                        Tailles, goûts et modalités de livraison
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color={THEME.border}
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
  container: { flex: 1, backgroundColor: THEME.background },
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
    backgroundColor: THEME.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.border,
  },

  profileSection: { paddingHorizontal: 32, paddingTop: 40, marginBottom: 40 },
  avatarRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 25 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 0,
    backgroundColor: "#F2F2F7",
    borderWidth: 1,
    borderColor: THEME.border,
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
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
  },
  statLab: {
    fontSize: 8,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1,
    marginTop: 4,
  },
  statDivider: { width: 1, height: 20, backgroundColor: THEME.border },

  identity: { marginBottom: 30 },
  name: {
    fontSize: 32,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    letterSpacing: -1,
  },
  handle: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.accent,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  bio: {
    fontSize: 14,
    color: THEME.textSecondary,
    marginTop: 12,
    lineHeight: 20,
    fontStyle: "italic",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },

  actionRow: { flexDirection: "row", gap: 12 },
  primaryBtn: {
    flex: 1,
    height: 50,
    backgroundColor: THEME.textMain,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  secondaryBtn: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: THEME.textMain,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryBtnText: {
    color: THEME.textMain,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  iconActionBtn: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: THEME.border,
    justifyContent: "center",
    alignItems: "center",
  },

  tabsWrapper: { paddingHorizontal: 32, marginBottom: 25 },
  tabsHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
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
    fontSize: 8,
    fontWeight: "800",
    color: THEME.textMain,
    letterSpacing: 1,
  },

  infoLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1.5,
  },
  infoValue: { fontSize: 13, fontWeight: "600", color: THEME.textMain },

  prefLink: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 25,
    padding: 20,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: THEME.border,
  },
  prefTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.textMain,
    letterSpacing: 1,
  },
  prefSub: { fontSize: 10, color: THEME.textSecondary, marginTop: 2 },
});
