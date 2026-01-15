import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

const RenderFriendCard = ({ item, index }: { item: any; index: number }) => {
  const colorScheme = useColorScheme();
  // On force le style "Luxe" (fond clair) par défaut, mais on garde la structure theme
  const isDark = colorScheme === "dark";
  const themeTextColor = isDark ? "#FFF" : "#111827";
  const themeSubTextColor = isDark ? "#9CA3AF" : "#6B7280";

  // Animation de pression (Spring)
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 50,
      useNativeDriver: true,
    }).start();
  };

  const navigateToFriendProfil = (friendId: string) => {
    router.push({
      pathname: "/profilFriend/[friendId]",
      params: { friendId },
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          marginTop: index === 0 ? 24 : 0, // Marge supérieure pour le premier item
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => navigateToFriendProfil(item.id)}
        style={[
          styles.cardBody,
          {
            backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
            borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
          },
        ]}
      >
        {/* SECTION GAUCHE : AVATAR */}
        <View style={styles.leftSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: item.avatarUrl }}
              style={styles.avatar}
              contentFit="cover"
              transition={400}
            />
            {/* Indicateur de statut connecté */}
            <View style={styles.statusDot} />
          </View>
        </View>

        {/* SECTION CENTRALE : INFOS */}
        <View style={styles.infoSection}>
          <Text
            style={[styles.name, { color: themeTextColor }]}
            numberOfLines={1}
          >
            {item.fullName}
          </Text>

          <Text
            style={[styles.bio, { color: themeSubTextColor }]}
            numberOfLines={1}
          >
            {item.description || "Collectionneur de souvenirs"}
          </Text>

          {/* MÉTADONNÉES DISCRÈTES */}
          <View style={styles.metaRow}>
            <Ionicons name="gift-outline" size={12} color={themeSubTextColor} />
            <Text style={[styles.metaText, { color: themeSubTextColor }]}>
              {item.wishlist?.length || 0} envies
            </Text>
          </View>
        </View>

        {/* SECTION DROITE : ACTION BOUTON */}
        <View style={styles.actionSection}>
          <View
            style={[
              styles.actionBtn,
              { backgroundColor: isDark ? "#374151" : "#111827" },
            ]}
          >
            <Text style={styles.actionBtnText}>Voir</Text>
            <Ionicons name="arrow-forward" size={12} color="#FFF" />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default RenderFriendCard;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  cardBody: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },

  /* GAUCHE - AVATAR */
  leftSection: {
    marginRight: 16,
  },
  avatarContainer: {
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F3F4F6",
  },
  statusDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#10B981",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },

  /* CENTRE - INFOS */
  infoSection: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.3,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  bio: {
    fontSize: 13,
    fontWeight: "500",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  /* DROITE - ACTION */
  actionSection: {
    marginLeft: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
