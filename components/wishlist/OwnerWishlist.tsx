import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";

import OwnerGiftDetailsModal from "@/components/gift/OwnerGiftDetailsModal";
import OwnerGiftCard from "@/components/gift/OwnerGiftCard";
import WishlistEditModal from "@/components/gift/WishlistEditModal";
import FloatingDockActions from "@/components/wishlist/floatingDock";
import ConfirmationModal from "@/components/gift/ConfirmationModal";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 60) / 2;

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
  const theme = useAppTheme();
  const [selectedGift, setSelectedGift] = useState<any>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteWishlistVisible, setIsDeleteWishlistVisible] = useState(false);
  const [giftToDelete, setGiftToDelete] = useState<any>(null);

  const scrollY = useRef(new Animated.Value(0)).current;
  const dockTranslateY = useRef(new Animated.Value(0)).current;

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
            <ThemedText
              type="label"
              colorName="textSecondary"
              style={styles.metaLabel}
            >
              {new Date(wishlist.eventDate)
                .toLocaleDateString("fr-FR", { day: "numeric", month: "long" })
                .toUpperCase()}
            </ThemedText>
          )}
          <View
            style={[styles.metaDivider, { backgroundColor: theme.accent }]}
          />
          <ThemedText
            type="label"
            colorName="textSecondary"
            style={styles.metaLabel}
          >
            {wishlist.visibility === "PUBLIC" ? "PUBLIC" : "PRIVÉ"}
          </ThemedText>
        </View>

        <ThemedText type="hero" style={styles.groupTitle}>
          {wishlist.title}
        </ThemedText>

        {wishlist.description && (
          <View style={styles.descriptionBox}>
            <View
              style={[styles.accentLine, { backgroundColor: theme.accent }]}
            />
            <ThemedText
              type="subtitle"
              colorName="textSecondary"
              style={styles.description}
            >
              {wishlist.description}
            </ThemedText>
          </View>
        )}
      </MotiView>
      <View
        style={[styles.sectionDivider, { backgroundColor: theme.accent }]}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View
        style={[
          styles.navbar,
          {
            paddingTop: insets.top,
            opacity: headerOpacity,
            backgroundColor: theme.background,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <ThemedText type="label" style={styles.navTitle} numberOfLines={1}>
          {wishlist.title.toUpperCase()}
        </ThemedText>
      </Animated.View>

      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + 10 }]}
        onPress={() => router.back()}
      >
        <ThemedIcon name="chevron-back" size={26} colorName="textMain" />
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
            <OwnerGiftCard
              gift={item}
              onPress={(gift) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedGift(gift);
              }}
              onRemove={(gift) => setGiftToDelete(gift)}
            />
          </View>
        )}
      />

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

      <OwnerGiftDetailsModal
        gift={selectedGift}
        visible={selectedGift !== null}
        onClose={() => setSelectedGift(null)}
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
  container: { flex: 1 },
  navbar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
  },
  navTitle: {
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
    letterSpacing: 1.5,
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 12,
  },
  groupTitle: {
    marginBottom: 20,
  },
  descriptionBox: { flexDirection: "row", gap: 20 },
  accentLine: { width: 1, opacity: 0.5 },
  description: {
    flex: 1,
  },
  sectionDivider: {
    width: 40,
    height: 2,
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
