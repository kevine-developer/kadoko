import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// --- THEME ---
const THEME = {
  white: "#FFFFFF",
  black: "#111827",
  textSecondary: "#6B7280",
  background: "#F9FAFB",
  border: "rgba(0,0,0,0.06)",
  success: "#10B981",
};

const GiftCardHome = ({ item }: { item: any }) => {
  const [liked, setLiked] = useState(false);

  // Gestion intelligente de la navigation
  const handleMainAction = () => {
    if (item.isReserved) {
      // SI RÉSERVÉ -> On redirige vers la Wishlist parente pour voir d'autres idées
      // Assure-toi que 'item.wishlistId' est bien passé dans tes données feedPosts
      router.push({
        pathname: "/gifts/wishlists/[wishlistId]",
        params: { wishlistId: item.wishlistId },
      });
      console.log("Wishlist ID: ", item.wishlistId);
    } else {
      // SI DISPO -> On va sur le détail du cadeau pour le réserver
      router.push({
        pathname: "/gifts/[giftId]",
        params: { giftId: item.id },
      });
      console.log("Gift ID: ", item.id);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      style={styles.cardContainer}
      onPress={() =>
        router.push({
          pathname: "/gifts/[giftId]",
          params: { giftId: item.id },
        })
      }
    >
      {/* 1. HEADER */}
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: item.user.avatar }}
              style={styles.userAvatar}
            />
            <View style={styles.contextDot} />
          </View>
          <View>
            <Text style={styles.userName}>{item.user.name}</Text>
            <Text style={styles.userContext}>{item.context}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setLiked(!liked)}
          style={styles.iconBtn}
        >
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={20}
            color={liked ? "#EF4444" : "#111827"}
          />
        </TouchableOpacity>
      </View>

      {/* 2. IMAGE PRINCIPALE */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: item.product.image }}
          style={styles.productImage}
          contentFit="cover"
          transition={400}
        />

        {/* Badge Prix */}
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>{item.product.price}€</Text>
        </View>

        {/* Overlay Réservé */}
        {item.isReserved && (
          <View style={styles.reservedOverlay}>
            <View style={styles.reservedBadge}>
              <Ionicons name="lock-closed" size={16} color="#FFF" />
              <Text style={styles.reservedText}>DÉJÀ OFFERT</Text>
            </View>
          </View>
        )}
      </View>

      {/* 3. FOOTER */}
      <View style={styles.cardFooter}>
        <View style={styles.titleRow}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.product.name}
          </Text>
        </View>

        <View style={styles.actionRow}>
          {/* BOUTON D'ACTION INTELLIGENT */}
          <TouchableOpacity
            style={[
              item.isReserved ? styles.secondaryBtn : styles.mainBtn, // Changement de style
            ]}
            activeOpacity={0.8}
            onPress={handleMainAction}
          >
            {/* Changement de texte et d'icône */}
            <Text
              style={[
                item.isReserved ? styles.secondaryBtnText : styles.mainBtnText,
              ]}
            >
              {item.isReserved ? "Voir la collection" : "Réserver ce cadeau"}
            </Text>

            <Ionicons
              name={item.isReserved ? "list-outline" : "arrow-forward"}
              size={item.isReserved ? 16 : 14}
              color={item.isReserved ? THEME.black : "#FFF"}
            />
          </TouchableOpacity>

          {/* Share Btn (seulement si dispo, sinon on garde le focus sur le bouton liste) */}
          {!item.isReserved && (
            <TouchableOpacity style={styles.shareBtn}>
              <Ionicons name="share-outline" size={20} color={THEME.black} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default GiftCardHome;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: THEME.white,
    borderRadius: 24,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
    borderWidth: 1,
    borderColor: THEME.border,
    overflow: "hidden",
  },

  /* HEADER */
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    position: "relative",
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#FFF",
  },
  contextDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.black,
    borderWidth: 1.5,
    borderColor: "#FFF",
  },
  userName: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.black,
    letterSpacing: -0.2,
  },
  userContext: {
    fontSize: 11,
    color: THEME.textSecondary,
    fontWeight: "500",
  },
  iconBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
  },

  /* IMAGE */
  imageWrapper: {
    height: 180,
    width: "100%",
    backgroundColor: "#F3F4F6",
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  priceTag: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  priceText: {
    fontWeight: "700",
    fontSize: 13,
    color: THEME.black,
  },
  reservedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  reservedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    backdropFilter: "blur(10px)",
  },
  reservedText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 1,
  },

  /* FOOTER */
  cardFooter: {
    padding: 10,
  },
  titleRow: {
    marginBottom: 20,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: "400",
    color: THEME.black,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    lineHeight: 28,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  /* --- BOUTON PRINCIPAL (NOIR) --- */
  mainBtn: {
    flex: 1,
    backgroundColor: THEME.black,
    height: 50,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: THEME.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  mainBtnText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
    letterSpacing: 0.5,
  },

  /* --- BOUTON SECONDAIRE (BLANC) POUR "VOIR LISTE" --- */
  secondaryBtn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    height: 50,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  secondaryBtnText: {
    color: THEME.black,
    fontWeight: "600",
    fontSize: 14,
  },

  shareBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
});
