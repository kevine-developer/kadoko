import ConfirmationModal from "@/components/gift/ConfirmationModal"; // ✅ Import du nouveau modal
import GiftAddModal from "@/components/gift/GiftAddModal";
import GiftDetailsModal from "@/components/gift/GiftDetailsModal";
import GiftItemGroup from "@/components/gift/GiftItemGroup";
import WishlistEditModal from "@/components/gift/WishlistEditModal";
import FloatingDockActions from "@/components/wishlist/floatingDock";
import { MOCK_USERS } from "@/mocks/users.mock";
import { MOCK_WISHLISTS } from "@/mocks/wishlists.mock";
import { Gift, GiftWishlist } from "@/types/gift";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// --- THEME ---
const THEME = {
  background: "#FDFBF7",
  textMain: "#111827",
  textSecondary: "#6B7280",
};

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 48) / 2;

export default function WishlistGroupView() {
  const { wishlistId } = useLocalSearchParams<{ wishlistId: string }>();
  const insets = useSafeAreaInsets();

  // --- STATES ---
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);

  // Modals d'édition
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // ✅ NOUVEAUX STATES POUR SUPPRESSION
  const [isDeleteWishlistVisible, setIsDeleteWishlistVisible] = useState(false);
  const [giftToDelete, setGiftToDelete] = useState<Gift | null>(null);
  const [isAddGiftVisible, setIsAddGiftVisible] = useState(false);

  // Animations
  const scrollY = useRef(new Animated.Value(0)).current;
  const dockTranslateY = useRef(new Animated.Value(0)).current;

  // Data
  const currentUserId = MOCK_USERS[0].id;
  const group: GiftWishlist | undefined = MOCK_WISHLISTS.find(
    (g) => g.id === wishlistId
  );
  const isOwner = group?.userId === currentUserId;

  // Animation Dock
  useEffect(() => {
    const isModalOpen = selectedGift !== null;
    Animated.spring(dockTranslateY, {
      toValue: isModalOpen ? 200 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 50,
    }).start();
  }, [dockTranslateY, selectedGift]);

  // --- HANDLERS ---
 // ✅ 2. Handler pour l'ajout
  const handleAddGift = (newGiftData: any) => {
    console.log("Nouveau cadeau à ajouter :", newGiftData);
    // TODO: Appeler API (ex: createGift(wishlistId, newGiftData))
    setIsAddGiftVisible(false);
  };
  const handleDeleteWishlist = () => {
    // ⚠️ TODO: Appeler API suppression wishlist ici
    console.log("Suppression de la wishlist :", wishlistId);
    setIsDeleteWishlistVisible(false);
    router.back(); // Retour à l'accueil après suppression
  };

  const handleDeleteGift = () => {
    if (giftToDelete) {
      // ⚠️ TODO: Appeler API suppression cadeau ici
      console.log("Suppression du cadeau :", giftToDelete.id);
      setGiftToDelete(null);
    }
  };

  if (!group) return null;

  // Header Animation Vars
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80, 120],
    outputRange: [0, 0, 1],
    extrapolate: "clamp",
  });
  const heroScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.1, 1],
    extrapolate: "clamp",
  });

  const ListHeader = () => (
    <Animated.View
      style={[styles.headerContainer, { transform: [{ scale: heroScale }] }]}
    >
      <View style={styles.heroSection}>
        <View style={styles.metaRow}>
          {group.eventDate && (
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>
                {new Date(group.eventDate)
                  .toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                  })
                  .toUpperCase()}
              </Text>
            </View>
          )}
          <View style={[styles.metaBadge, styles.metaBadgeOutline]}>
            <View style={styles.dot} />
            <Text style={styles.metaText}>
              {isOwner ? "MA LISTE" : "PUBLIC"}
            </Text>
          </View>
        </View>

        <Text style={styles.groupTitle}>{group.title}</Text>

        {group.description && (
          <View style={styles.descriptionWrapper}>
            <View style={styles.verticalLine} />
            <Text style={styles.description}>{group.description}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Navbar Sticky */}
      <Animated.View
        style={[
          styles.navbar,
          {
            height: 50 + insets.top,
            paddingTop: insets.top,
            opacity: headerOpacity,
          },
        ]}
      >
        <Text style={styles.navTitle} numberOfLines={1}>
          {group.title}
        </Text>
        <View style={styles.navBorder} />
      </Animated.View>

      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 4 }]}
        onPress={() => router.back()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="arrow-back" size={24} color={THEME.textMain} />
      </TouchableOpacity>

      {/* Grid List */}
      <Animated.FlatList
        data={group.gifts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.rowWrapper}
        contentContainerStyle={{ paddingTop: 100, paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        ListHeaderComponent={<ListHeader />}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 16, width: ITEM_WIDTH }}>
            <GiftItemGroup
              gift={item}
              onPress={(gift) => setSelectedGift(gift)}
              // ✅ On passe la fonction pour déclencher le modal de suppression
              onRemove={isOwner ? (gift) => setGiftToDelete(gift) : undefined}
              isOwner={isOwner}
            />
          </View>
        )}
      />

      {/* DOCK FLOTTANT */}
      {isOwner && (
        <Animated.View
          style={[
            styles.dockWrapper,
            {
              bottom: insets.bottom + 20,
              transform: [{ translateY: dockTranslateY }],
            },
          ]}
        >
          <FloatingDockActions
            handleAdd={() => setIsAddGiftVisible(true)}
            handleEdit={() => setIsEditModalVisible(true)}
            // ✅ Déclenche le modal de suppression de liste
            handleDelete={() => setIsDeleteWishlistVisible(true)}
          />
        </Animated.View>
      )}

      {/* --- MODALS --- */}

      <GiftDetailsModal
        gift={selectedGift}
        visible={selectedGift !== null}
        onClose={() => setSelectedGift(null)}
        isOwner={isOwner}
        
      />

      <WishlistEditModal
        wishlist={group}
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onSave={(data) => {
          console.log("Update", data);
          setIsEditModalVisible(false);
        }}
      />

      {/* ✅ MODAL 1 : SUPPRESSION WISHLIST */}
      <ConfirmationModal
        visible={isDeleteWishlistVisible}
        onClose={() => setIsDeleteWishlistVisible(false)}
        onConfirm={handleDeleteWishlist}
        title="Supprimer la collection ?"
        description="Cette action est irréversible. Tous les cadeaux associés seront également supprimés."
        confirmText="Supprimer"
        isDestructive={true}
      />

      {/* ✅ MODAL 2 : SUPPRESSION CADEAU */}
      <ConfirmationModal
        visible={giftToDelete !== null}
        onClose={() => setGiftToDelete(null)}
        onConfirm={handleDeleteGift}
        title="Retirer ce cadeau ?"
        description={`Voulez-vous vraiment supprimer "${giftToDelete?.title}" de votre liste ?`}
        confirmText="Retirer"
        isDestructive={true}
      />
        {/* ✅ 4. Intégration du composant */}
      <GiftAddModal
        visible={isAddGiftVisible}
        onClose={() => setIsAddGiftVisible(false)}
        onAdd={handleAddGift}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  // ... (Garder tes styles existants pour header, navbar, etc. ci-dessous)
  navbar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: "rgba(253, 251, 247, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(10px)",
  },
  navBorder: {
    position: "absolute",
    bottom: 0,
    left: 24,
    right: 24,
    height: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  navTitle: {
    color: THEME.textMain,
    fontWeight: "600",
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  backButton: {
    position: "absolute",
    left: 24,
    zIndex: 20,
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerContainer: { marginBottom: 24, paddingHorizontal: 24 },
  heroSection: { paddingTop: 20 },
  metaRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  metaBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
  },
  metaBadgeOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 11,
    fontWeight: "700",
    color: THEME.textMain,
    letterSpacing: 1,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#10B981" },
  groupTitle: {
    fontSize: 40,
    fontWeight: "400",
    color: THEME.textMain,
    letterSpacing: -1,
    marginBottom: 16,
    lineHeight: 48,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  descriptionWrapper: { flexDirection: "row", gap: 16 },
  verticalLine: { width: 2, backgroundColor: THEME.textMain, opacity: 0.8 },
  description: {
    flex: 1,
    fontSize: 15,
    color: THEME.textSecondary,
    lineHeight: 24,
    fontStyle: "italic",
  },
  rowWrapper: { justifyContent: "space-between", paddingHorizontal: 16 },
  dockWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 5,
  },
});
