import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState, useEffect } from "react";
import {
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import PagerView from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { userService } from "@/lib/services/user-service";
import { wishlistService } from "@/lib/services/wishlist-service";
import HeaderParallax from "@/components/ProfilUI/HeaderParallax";
import { HEADER_HEIGHT } from "@/constants/const";
import GiftWishlistCard from "@/components/ProfilUI/GiftCard";
import EmptyContent from "@/components/EmptyContent";

export default function PublicUserProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { username } = useLocalSearchParams<{ username: string }>();

  const [user, setUser] = useState<any>(null);
  const [userWishlists, setUserWishlists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activePage, setActivePage] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadPublicProfile();
  }, [username]);

  const loadPublicProfile = async () => {
    if (!username) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Récupérer l'utilisateur
      const userRes = await userService.getUserByUsername(username);

      if (!userRes.success || !userRes.user) {
        setError("Profil introuvable ou privé.");
        setLoading(false);
        return;
      }

      setUser(userRes.user);

      // 2. Récupérer les listes (si l'utilisateur existe)
      const wlRes = await wishlistService.getUserWishlists(userRes.user.id);
      if (wlRes.success) {
        setUserWishlists(wlRes.wishlists);
      }
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement du profil.");
    } finally {
      setLoading(false);
    }
  };

  const wishesMapped = userWishlists.map((wl) => ({
    wishlistId: wl.id,
    wishlistTitle: wl.title,
    totalGifts: wl._count?.gifts || 0,
    wishlistVisibility: wl.visibility,
    images: wl.gifts?.map((g: any) => g.imageUrl).filter(Boolean) || [],
  }));

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

  const handleTabPress = (index: number) => {
    setActivePage(index);
    pagerRef.current?.setPage(index);
  };

  const onPageSelected = (e: any) => {
    setActivePage(e.nativeEvent.position);
  };

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

  if (loading && !user) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>
          {error || "Utilisateur introuvable"}
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* 1. HEADER PARALLAX */}
      <HeaderParallax
        user={user}
        headerOpacity={headerOpacity}
        imageScale={imageScale}
      />

      {/* 2. TOP BAR (Back Button) */}
      <View style={[styles.navBar, { top: insets.top }]}>
        <TouchableOpacity
          style={styles.iconButtonBlur}
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/")
          }
        >
          <Ionicons name="arrow-back" size={20} color="#FFF" />
        </TouchableOpacity>
        <View />
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
        {/* 3. PROFILE CARD */}
        <View style={styles.profileCard}>
          {/* Mode Read-Only: on désactive l'édition avatar et le bouton éditer */}
          <View style={styles.cardHeader}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarContainer}>
                {/* On utilise une Image simple ou le composant Image d'expo */}
                {/* Pour simplifier, on reprend une structure proche de ProfilCard mais statique */}
              </View>
            </View>
            {/* On réutilise ProfilCard mais on cache le bouton éditer via style ou condition */}
            {/* Ou mieux, on fait un composant PublicProfilCard. Pour l'instant on garde ProfilCard et on passera une prop readOnly si besoin, 
                    mais ProfilCard a des boutons hardcodés. On va recreer une vue simplifiée ici. */}

            <View style={{ alignItems: "center", marginBottom: 24 }}>
              <View style={styles.avatarBorder}>
                <Image
                  source={{
                    uri:
                      user.image ||
                      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400",
                  }}
                  style={{ width: "100%", height: "100%", borderRadius: 40 }}
                  contentFit="cover"
                />
              </View>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userHandle}>
                @{user.username || user.email?.split("@")[0]}
              </Text>
              <Text style={styles.description}>{user.description}</Text>

              {/* Stats (Optionnel) */}
            </View>
          </View>
        </View>

        {/* 4. TABS (Seulement les listes pour le public ?) */}
        {/* On peut afficher "Listes de cadeaux" (WISHES) et c'est tout pour l'instant */}

        <View style={styles.tabsContainer}>
          <View style={styles.tabsInner}>
            {renderTab("Listes de cadeaux", "gift", 0)}
          </View>
        </View>

        {/* 5. CONTENT AREA */}
        <View style={{ minHeight: 600 }}>
          <View style={styles.gridContainer}>
            {wishesMapped.length > 0 ? (
              wishesMapped.map((wishlist: any) => (
                <View key={wishlist.wishlistId} style={{ marginBottom: 16 }}>
                  {/* On utilise une carte qui ne permet pas l'édition, mais GiftWishlistCard gère le clic vers le détail */}
                  {/* Il faudra s'assurer que GiftWishlistCard dirige vers une page publique ou gère les droits */}
                  <GiftWishlistCard {...wishlist} />
                </View>
              ))
            ) : (
              <EmptyContent
                title="Cet utilisateur n'a pas encore de listes publiques."
                icon="gift-outline"
                subtitle=""
              />
            )}
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#EF4444",
    fontWeight: "600",
  },
  backBtn: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#111827",
    borderRadius: 20,
  },
  backBtnText: { color: "#FFF", fontWeight: "600" },

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
  iconButtonBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(10px)",
  },

  profileCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 32,
    padding: 24,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 6,
    alignItems: "center",
  },
  cardHeader: { alignItems: "center", width: "100%" },
  avatarWrapper: {
    position: "relative",
    marginBottom: 0,
  },
  avatarContainer: {
    alignItems: "center",
  },
  avatarBorder: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    borderColor: "#FFF",
    backgroundColor: "#E5E7EB",
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 4,
  },
  userHandle: { fontSize: 14, color: "#9CA3AF", marginBottom: 16 },
  description: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    paddingHorizontal: 20,
  },

  tabsContainer: { paddingHorizontal: 20, marginBottom: 24 },
  tabsInner: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 20,
  },
  tabItemActive: { backgroundColor: "#111827" },
  tabText: { fontSize: 13, fontWeight: "600", color: "#6B7280" },
  tabTextActive: { color: "#FFFFFF" },

  pagerView: { flex: 1 },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 5,
    paddingHorizontal: 20,
  },
});
