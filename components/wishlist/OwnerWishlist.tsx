import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";

import GiftDetailsModal from "@/components/gift/GiftDetailsModal";
import GiftItemGroup from "@/components/gift/GiftItemGroup";
import WishlistEditModal from "@/components/gift/WishlistEditModal";
import FloatingDockActions from "@/components/wishlist/floatingDock";
import ConfirmationModal from "@/components/gift/ConfirmationModal";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 60) / 2;

const THEME = {
  background: "#FDFBF7",
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062",
  border: "rgba(0,0,0,0.06)",
};

interface OwnerWishlistProps {
  wishlist: any;
  insets: any;
  onRefresh: () => Promise<void>;
  handleDeleteWishlist: () => Promise<void>;
  handleUpdateWishlist: (data: any) => Promise<void>;
  handleDeleteGift: (giftId: string) => Promise<void>;
}

export default function OwnerWishlist({
  wishlist,
  insets,
  onRefresh,
  handleDeleteWishlist,
  handleUpdateWishlist,
  handleDeleteGift,
}: OwnerWishlistProps) {
  const [selectedGift, setSelectedGift] = useState<any>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteWishlistVisible, setIsDeleteWishlistVisible] = useState(false);
  const [giftToDelete, setGiftToDelete] = useState<any>(null);

  const scrollY = useRef(new Animated.Value(0)).current;
  const dockTranslateY = useRef(new Animated.Value(0)).current;

  // Animation Dock
  useEffect(() => {
    const isModalOpen =
      selectedGift !== null ||
      isEditModalVisible ||
      isDeleteWishlistVisible ||
      giftToDelete !== null;
    Animated.spring(dockTranslateY, {
      toValue: isModalOpen ? 200 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 50,
    }).start();
  }, [
    selectedGift,
    isEditModalVisible,
    isDeleteWishlistVisible,
    giftToDelete,
    dockTranslateY,
  ]);

  const handleAddGift = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/(screens)/gifts/addGift",
      params: { wishlistId: wishlist.id },
    });
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [100, 150],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const ListHeader = () => (
    <View style={styles.heroSection}>
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 700 }}
      >
        <View style={styles.metaRow}>
          {wishlist.eventDate && (
            <Text style={styles.metaLabel}>
              {new Date(wishlist.eventDate)
                .toLocaleDateString("fr-FR", { day: "numeric", month: "long" })
                .toUpperCase()}
            </Text>
          )}
          <View style={styles.metaDivider} />
          <Text style={styles.metaLabel}>
            {wishlist.visibility === "PUBLIC" ? "PUBLIC" : "PRIVÉ"}
          </Text>
        </View>

        <Text style={styles.groupTitle}>{wishlist.title}</Text>

        {wishlist.description && (
          <View style={styles.descriptionBox}>
            <View style={styles.accentLine} />
            <Text style={styles.description}>{wishlist.description}</Text>
          </View>
        )}
      </MotiView>
      <View style={styles.sectionDivider} />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* STICKY NAV BAR */}
      <Animated.View
        style={[
          styles.navbar,
          { paddingTop: insets.top, opacity: headerOpacity },
        ]}
      >
        <Text style={styles.navTitle} numberOfLines={1}>
          {wishlist.title.toUpperCase()}
        </Text>
      </Animated.View>

      {/* BACK ACTION */}
      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + 10 }]}
        onPress={() => router.back()}
      >
        <Ionicons name="chevron-back" size={26} color={THEME.textMain} />
      </TouchableOpacity>

      <Animated.FlatList
        data={wishlist.gifts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={{
          paddingTop: insets.top + 60,
          paddingBottom: 150,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        ListHeaderComponent={<ListHeader />}
        renderItem={({ item }) => (
          <View style={{ width: ITEM_WIDTH, marginBottom: 25 }}>
            <GiftItemGroup
              gift={item}
              onPress={(gift) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedGift(gift);
              }}
              onRemove={(gift) => setGiftToDelete(gift)}
              isOwner={true}
            />
          </View>
        )}
      />

      {/* ACTION DOCK */}
      <Animated.View
        style={[
          styles.dockContainer,
          {
            bottom: insets.bottom + 20,
            transform: [{ translateY: dockTranslateY }],
          },
        ]}
      >
        <FloatingDockActions
          handleAdd={handleAddGift}
          handleEdit={() => setIsEditModalVisible(true)}
          handleDelete={() => setIsDeleteWishlistVisible(true)}
        />
      </Animated.View>

      {/* MODALS */}
      <GiftDetailsModal
        gift={selectedGift}
        visible={selectedGift !== null}
        onClose={() => setSelectedGift(null)}
        isOwner={true}
        onActionSuccess={onRefresh}
      />

      <WishlistEditModal
        wishlist={wishlist}
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onSave={handleUpdateWishlist}
      />

      <ConfirmationModal
        visible={isDeleteWishlistVisible}
        onClose={() => setIsDeleteWishlistVisible(false)}
        onConfirm={handleDeleteWishlist}
        title="Supprimer la collection"
        description="Cette pièce et tout son contenu seront définitivement retirés de votre registre."
        confirmText="CONFIRMER"
        isDestructive
      />

      <ConfirmationModal
        visible={giftToDelete !== null}
        onClose={() => setGiftToDelete(null)}
        onConfirm={async () => {
          if (giftToDelete) {
            await handleDeleteGift(giftToDelete.id);
            setGiftToDelete(null);
          }
        }}
        title="Retirer l'article"
        description={`Voulez-vous supprimer "${giftToDelete?.title}" de cette collection ?`}
        confirmText="RETIRER"
        isDestructive
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  navbar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: THEME.background,
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  navTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.textMain,
    letterSpacing: 2,
    marginTop: 10,
  },
  backBtn: {
    position: "absolute",
    left: 20,
    zIndex: 20,
    width: 44,
    height: 44,
    justifyContent: "center",
  },
  heroSection: { paddingHorizontal: 30, marginBottom: 30 },
  metaRow: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  metaLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1.5,
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.accent,
    marginHorizontal: 12,
  },
  groupTitle: {
    fontSize: 42,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    lineHeight: 48,
    letterSpacing: -1,
    marginBottom: 20,
  },
  descriptionBox: { flexDirection: "row", gap: 20 },
  accentLine: { width: 1, backgroundColor: THEME.accent, opacity: 0.5 },
  description: {
    flex: 1,
    fontSize: 15,
    color: THEME.textSecondary,
    lineHeight: 24,
    fontStyle: "italic",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  sectionDivider: {
    width: 40,
    height: 2,
    backgroundColor: THEME.accent,
    marginTop: 35,
  },
  columnWrapper: { justifyContent: "space-between", paddingHorizontal: 25 },
  dockContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 30,
  },
});
