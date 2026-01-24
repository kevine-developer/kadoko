import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";

import GiftDetailsModal from "@/components/gift/GiftDetailsModal";
import GiftItemGroup from "@/components/gift/GiftItemGroup";

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
        {/* AVATAR PROPRIÉTAIRE */}
        <View style={styles.ownerInfo}>
          <Image
            source={{
              uri: wishlist.user?.image || "https://i.pravatar.cc/150",
            }}
            style={styles.ownerAvatar}
          />
          <View>
            <Text style={styles.ownerName}>
              {wishlist.user?.name || "Membre"}
            </Text>
            <Text style={styles.ownerRole}>PROPRIÉTAIRE</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          {wishlist.eventDate && (
            <Text style={styles.metaLabel}>
              {new Date(wishlist.eventDate)
                .toLocaleDateString("fr-FR", { day: "numeric", month: "long" })
                .toUpperCase()}
            </Text>
          )}
          <View style={styles.metaDivider} />
          <Text style={styles.metaLabel}>INVITATION</Text>
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
            <GiftItemGroup
              gift={item}
              onPress={(gift) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedGift(gift);
              }}
              isOwner={false}
            />
          </View>
        )}
      />

      {/* MODALS */}
      <GiftDetailsModal
        gift={selectedGift}
        visible={selectedGift !== null}
        onClose={() => setSelectedGift(null)}
        isOwner={false}
        onActionSuccess={onRefresh}
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
  ownerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 25,
    backgroundColor: "rgba(175, 144, 98, 0.05)",
    padding: 12,
    borderRadius: 0,
    borderLeftWidth: 2,
    borderLeftColor: THEME.accent,
  },
  ownerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.accent,
  },
  ownerName: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.textMain,
    letterSpacing: -0.2,
  },
  ownerRole: {
    fontSize: 8,
    fontWeight: "800",
    color: THEME.accent,
    letterSpacing: 1,
  },
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
});
