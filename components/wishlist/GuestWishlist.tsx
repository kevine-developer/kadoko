import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";

import GuestGiftDetailsModal from "@/components/gift/GuestGiftDetailsModal";
import GuestGiftCard from "@/components/gift/GuestGiftCard";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 60) / 2;

interface GuestWishlistProps {
  wishlist: any;
  insets: any;
  onRefresh: () => Promise<void>;
}

export default function GuestWishlist({
  wishlist,
  insets,
  onRefresh,
}: GuestWishlistProps) {
  const theme = useAppTheme();
  const [selectedGift, setSelectedGift] = useState<any>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

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
        <View
          style={[
            styles.ownerInfo,
            {
              backgroundColor: `rgba(${theme.accent.replace(/[^0-9,]/g, "")}, 0.05)`,
              borderLeftColor: theme.accent,
            },
          ]}
        >
          <Image
            source={{
              uri: wishlist.user?.image || "https://i.pravatar.cc/150",
            }}
            style={[styles.ownerAvatar, { borderColor: theme.accent }]}
          />
          <View>
            <ThemedText type="defaultBold" style={styles.ownerName}>
              {wishlist.user?.name || "Membre"}
            </ThemedText>
            <ThemedText type="label" colorName="accent">
              PROPRIÉTAIRE
            </ThemedText>
          </View>
        </View>

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
            INVITATION
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
        data={wishlist.gifts?.filter((g: any) => g.isPublished)}
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
            <GuestGiftCard
              gift={item}
              onPress={(gift) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedGift(gift);
              }}
            />
          </View>
        )}
      />

      <GuestGiftDetailsModal
        gift={selectedGift}
        visible={selectedGift !== null}
        onClose={() => setSelectedGift(null)}
        onActionSuccess={onRefresh}
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
  ownerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 25,
    padding: 12,
    borderRadius: 0,
    borderLeftWidth: 2,
  },
  ownerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
  },
  ownerName: {
    letterSpacing: -0.2,
  },
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
});
