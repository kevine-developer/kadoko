import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useRef, useState } from "react";
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

// Composants existants
import GiftWishlistCard from "@/components/GiftCard";
import ReservedGiftItem from "@/components/ProfilUI/ReservedGiftItem";

// Libs & Mocks
import {
  getUserPurchasedGiftsWithContext,
  getUserReservedGiftsWithContext,
} from "@/lib/getUserGifts";
import { getWishlistPhotos } from "@/lib/getWishlistPhotos";
import { getUserWishlists } from "@/lib/userWishlists";
import { MOCK_USERS } from "@/mocks/users.mock";
import { MOCK_WISHLISTS } from "@/mocks/wishlists.mock";

// --- DATA SETUP ---
const user = MOCK_USERS[0];
const reservedGifts = getUserReservedGiftsWithContext(user);
const purchasedGifts = getUserPurchasedGiftsWithContext(user);
const userWishlists = getUserWishlists(MOCK_WISHLISTS, user.wishlists);
const MOCK_WISHES = getWishlistPhotos(userWishlists);

const TABS = {
  RESERVED: 0,
  WISHES: 1,
  BOUGHT: 2,
};

export default function ModernUserProfileScreen() {
  const insets = useSafeAreaInsets();
  const [activePage, setActivePage] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // --- ANIMATIONS ---
  const headerHeight = 320;

  const handleSettingsPress = () => {};
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

  // --- HANDLERS ---
  const handleTabPress = (index: number) => {
    setActivePage(index);
    pagerRef.current?.setPage(index);
  };

  const onPageSelected = (e: any) => {
    setActivePage(e.nativeEvent.position);
  };

  // --- RENDERERS ---
  const renderTab = (
    label: string,
    icon: keyof typeof Ionicons.glyphMap,
    index: number
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
      <Animated.View
        style={[styles.headerContainer, { opacity: headerOpacity }]}
      >
        <Animated.Image
          source={{
            uri: user.avatarUrl,
          }}
          style={[styles.headerImage, { transform: [{ scale: imageScale }] }]}
        />
        <View style={styles.headerOverlay} />
        {/* Dégradé pour fondre avec la carte */}
        <View style={styles.headerGradient} />
      </Animated.View>

      {/* 2. TOP BAR */}
      <View style={[styles.navBar, { top: insets.top }]}>
        <View /> {/* Spacer */}
        <View style={styles.navActions}>
          <TouchableOpacity style={styles.iconButtonBlur}>
            <Ionicons name="qr-code-outline" size={20} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButtonBlur}
            onPress={handleSettingsPress}
          >
            <Ionicons name="settings-outline" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 140 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* 3. PROFILE CARD (Overlap & Luxe) */}
        <View style={styles.profileCard}>
          <View style={styles.cardHeader}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
              <View style={styles.editAvatarBadge}>
                <Ionicons name="pencil" size={10} color="#FFF" />
              </View>
            </View>

            <View style={styles.identityContainer}>
              <Text style={styles.userName}>{user.fullName}</Text>
              <Text style={styles.userHandle}>@{user.email.split("@")[0]}</Text>
            </View>

            <TouchableOpacity style={styles.editProfileBtn}>
              <Text style={styles.editProfileText}>Éditer</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Minimalistes */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userWishlists.length}</Text>
              <Text style={styles.statLabel}>Collections</Text>
            </View>
            <View style={styles.verticalLine} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{reservedGifts.length}</Text>
              <Text style={styles.statLabel}>Réservés</Text>
            </View>
            <View style={styles.verticalLine} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{purchasedGifts.length}</Text>
              <Text style={styles.statLabel}>Offerts</Text>
            </View>
          </View>
        </View>

        {/* 4. TABS FLOTTANTS (Style Menu) */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabsInner}>
            {renderTab("À Offrir", "star", TABS.RESERVED)}
            {renderTab("Mes Listes", "gift", TABS.WISHES)}
            {renderTab("Historique", "time", TABS.BOUGHT)}
          </View>
        </View>

        {/* 5. CONTENT AREA */}
        <View style={{ minHeight: 600 }}>
          <PagerView
            ref={pagerRef}
            style={styles.pagerView}
            initialPage={0}
            onPageSelected={onPageSelected}
          >
            {/* PAGE 1: RESERVED */}
            <View key="1" style={styles.pageContent}>
              {reservedGifts.length > 0 ? (
                reservedGifts.map((gift) => (
                  <View key={gift.id} style={{ marginBottom: 20 }}>
                    <ReservedGiftItem
                      gift={gift}
                      ownerName={gift.owner.fullName}
                      onPurchased={() => {}}
                      eventDate={gift.wishlist.eventDate}
                    />
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="gift-outline" size={40} color="#D1D5DB" />
                  <Text style={styles.emptyText}>
                    Aucune réservation active.
                  </Text>
                </View>
              )}
            </View>

            {/* PAGE 2: WISHES */}
            <View key="2" style={styles.pageContent}>
              <View style={styles.gridContainer}>
                {MOCK_WISHES.map((wishlist) => (
                  <View key={wishlist.wishlistId} style={{ marginBottom: 16 }}>
                    <GiftWishlistCard {...wishlist} />
                  </View>
                ))}
              </View>
              <TouchableOpacity style={styles.addListBtn}>
                <Ionicons name="add" size={24} color="#111827" />
                <Text style={styles.addListText}>Nouvelle collection</Text>
              </TouchableOpacity>
            </View>

            {/* PAGE 3: BOUGHT */}
            <View key="3" style={styles.pageContent}>
              {purchasedGifts.length > 0 ? (
                purchasedGifts.map((gift) => (
                  <View key={gift.id} style={{ marginBottom: 16 }}>
                    <ReservedGiftItem
                      gift={gift}
                      ownerName={gift.owner.fullName}
                      onPurchased={() => {}}
                      eventDate={gift.wishlist.eventDate}
                    />
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="receipt-outline" size={40} color="#D1D5DB" />
                  <Text style={styles.emptyText}>Historique vide.</Text>
                </View>
              )}
            </View>
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

  /* --- HEADER --- */
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 240,
    backgroundColor: "#111827",
  },
  headerImage: {
    width: "100%",
    height: "100%",
    opacity: 0.7,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  headerGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: "transparent",
    // Note: Pour un vrai dégradé sur React Native sans Expo Linear Gradient,
    // on utilise souvent une image PNG transparente ou on laisse tel quel.
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
  navActions: {
    flexDirection: "row",
    gap: 12,
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
    backdropFilter: "blur(12px)",
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center", // Alignement centré verticalement
    marginBottom: 24,
  },
  avatarWrapper: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    backgroundColor: "#F3F4F6",
  },
  editAvatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#111827",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  identityContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: "500",
    color: "#111827",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginBottom: 2,
  },
  userHandle: {
    fontSize: 14,
    color: "#9CA3AF",
    letterSpacing: 0.5,
  },
  editProfileBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  editProfileText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },

  /* STATS */
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  verticalLine: {
    width: 1,
    height: 30,
    backgroundColor: "#F3F4F6",
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
  pageContent: {
    paddingHorizontal: 20,
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
    borderStyle: "dashed", // Optionnel, mais ici on préfère souvent solid pour le luxe
  },
  addListText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    letterSpacing: 0.5,
  },

  /* Empty State */
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 16,
    opacity: 0.7,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 15,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontStyle: "italic",
  },
});
