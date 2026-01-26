import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Animated,
  Linking,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { shareGift } from "@/lib/share";
import { ThemedText } from "@/components/themed-text";
import Icon from "@/components/themed-icon";
import { useThemeColor } from "@/hooks/use-theme-color";
import { GiftPriority } from "@/types/gift";

interface GiftCardHomeProps {
  item: any;
}

const GiftCardHome = ({ item }: GiftCardHomeProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isExpanded, setIsExpanded] = useState(false);

  // Couleurs du thème
  const backgroundColor = useThemeColor({}, "background");
  const surfaceColor = useThemeColor({}, "surface");
  const textMain = useThemeColor({}, "textMain");
  const textSecondary = useThemeColor({}, "textSecondary");
  const accentColor = useThemeColor({}, "accent");
  const borderColor = useThemeColor({}, "border");
  const errorColor = useThemeColor({}, "danger");
  const ecoColor = "#4A6741"; // Vert forêt luxe

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.99,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const getHostname = (url: string) => {
    try {
      return url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split("/")[0];
    } catch {
      return "Boutique";
    }
  };

  const getPriorityConfig = (priority?: string) => {
    switch (priority) {
      case GiftPriority.ESSENTIAL:
        return { label: "INDISPENSABLE", color: errorColor };
      case GiftPriority.DESIRED:
        return { label: "COUP DE COEUR", color: accentColor };
      case GiftPriority.OPTIONAL:
        return { label: "IDÉE CADEAU", color: textSecondary };
      default:
        return null;
    }
  };

  const isTaken = item.isReserved || item.isPurchased;
  const priority = getPriorityConfig(item.priority);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: surfaceColor,
          borderColor,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* 1. HEADER : IDENTITÉ ÉDITORIALE */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => router.push(`/profilFriend/${item.user.id}`)}
        >
          <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
          <View>
            <ThemedText type="defaultBold" style={styles.userName}>
              {item.user.name}
            </ThemedText>
            <ThemedText
              type="label"
              style={{ color: accentColor, fontSize: 8 }}
            >
              {item.context.toUpperCase()}
            </ThemedText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => shareGift(item.id, item.product.name)}
          style={styles.iconBtn}
        >
          <Icon name="share-outline" size={20} color={textMain} />
        </TouchableOpacity>
      </View>

      {/* 2. IMAGE IMMERSIVE (Style Insta/TikTok 4:5) */}
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => router.push(`/(screens)/gifts/${item.id}`)}
        style={styles.imageFrame}
      >
        <Image
          source={{ uri: item.product.image }}
          style={[styles.image, isTaken && styles.imageDimmed]}
          contentFit="cover"
          transition={500}
        />

        {/* Badges flottants sur l'image */}
        <View style={styles.imageBadges}>
          {priority && (
            <View style={[styles.badge, { backgroundColor: surfaceColor }]}>
              <ThemedText
                type="label"
                style={{ color: priority.color, fontSize: 8 }}
              >
                {priority.label}
              </ThemedText>
            </View>
          )}
          {item.acceptsSecondHand && (
            <View style={[styles.badge, { backgroundColor: surfaceColor }]}>
              <Icon name="leaf" size={10} color={ecoColor} />
              <ThemedText
                type="label"
                style={{ color: ecoColor, fontSize: 8, marginLeft: 4 }}
              >
                SECONDE MAIN
              </ThemedText>
            </View>
          )}
        </View>

        {isTaken && (
          <View style={styles.takenOverlay}>
            <View style={styles.takenTag}>
              <ThemedText type="label" style={styles.takenText}>
                {item.isPurchased ? "ACQUIS" : "RÉSERVÉ"}
              </ThemedText>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* 3. SECTION CONTENU (Description & Info) */}
      <View style={styles.contentSection}>
        <View style={styles.titleRow}>
          <ThemedText type="title" style={styles.productTitle}>
            {item.product.name}
          </ThemedText>
          <ThemedText type="title" style={styles.priceText}>
            {item.product.price}€
          </ThemedText>
        </View>

        {item.product.url && (
          <TouchableOpacity
            onPress={() => Linking.openURL(item.product.url)}
            style={styles.sourceLink}
          >
            <Icon name="link-outline" size={12} color={textSecondary} />
            <ThemedText type="caption" style={styles.sourceName}>
              {getHostname(item.product.url).toUpperCase()}
            </ThemedText>
          </TouchableOpacity>
        )}

        {/* Description Expandable */}
        {(item.product.description || item.notes) && (
          <View style={styles.descriptionContainer}>
            <ThemedText
              type="default"
              numberOfLines={isExpanded ? undefined : 2}
              style={styles.descriptionText}
            >
              {item.notes && (
                <ThemedText type="defaultBold" style={{ color: accentColor }}>
                  Note :{" "}
                </ThemedText>
              )}
              {item.notes || item.product.description}
            </ThemedText>

            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                setIsExpanded(!isExpanded);
              }}
            >
              <ThemedText type="label" style={styles.moreBtn}>
                {isExpanded ? "VOIR MOINS" : "LIRE LA SUITE"}
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Divider discret */}
        <View style={[styles.divider, { backgroundColor: borderColor }]} />

        {/* 4. FOOTER : STATUS & CTAs */}
        {isTaken && !item.isMyReservation ? (
          <View style={styles.reservationFooter}>
            <View style={styles.reserverInfo}>
              <Image
                source={{
                  uri: item.reservedBy?.image || "https://i.pravatar.cc/150",
                }}
                style={styles.reserverAvatar}
              />
              <ThemedText type="caption" style={{ fontStyle: "italic" }}>
                {item.isPurchased ? "Offert par " : "Réservé par "}
                <ThemedText type="defaultBold" style={{ fontSize: 12 }}>
                  {item.reservedBy?.name}
                </ThemedText>
              </ThemedText>
            </View>

            <TouchableOpacity
              style={[styles.alertBtn, { borderColor: textMain }]}
              onPress={() =>
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success,
                )
              }
            >
              <Icon name="notifications-outline" size={14} color={textMain} />
              <ThemedText type="label" style={styles.alertBtnText}>
                M&apos;ALERTER
              </ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.mainCta, { backgroundColor: textMain }]}
            onPress={() => router.push(`/(screens)/gifts/${item.id}`)}
          >
            <ThemedText type="label" style={styles.ctaText}>
              {item.isMyReservation ? "MA RÉSERVATION" : "VOIR LES DÉTAILS"}
            </ThemedText>
            <Icon name="chevron-forward" size={14} color={backgroundColor} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
    borderWidth: 1,
    borderRadius: 0,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 0,
    backgroundColor: "#F2F2F7",
  },
  userName: {
    fontSize: 14,
    letterSpacing: -0.3,
  },
  iconBtn: {
    padding: 4,
  },
  imageFrame: {
    width: "100%",
    aspectRatio: 0.8, // Format portrait immersif
    backgroundColor: "#F9FAFB",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageDimmed: {
    opacity: 0.7,
  },
  imageBadges: {
    position: "absolute",
    top: 15,
    left: 15,
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.05)",
  },
  takenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(253, 251, 247, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  takenTag: {
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  takenText: {
    color: "#FFF",
    fontSize: 10,
    letterSpacing: 2,
  },
  contentSection: {
    padding: 20,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 22,
    flex: 1,
    marginRight: 10,
  },
  priceText: {
    fontSize: 20,
    fontWeight: "300",
  },
  sourceLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 15,
  },
  sourceName: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  descriptionContainer: {
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#4B5563",
  },
  moreBtn: {
    fontSize: 9,
    color: "#AF9062",
    marginTop: 6,
    fontWeight: "800",
  },
  divider: {
    height: 1,
    width: "100%",
    marginVertical: 20,
    opacity: 0.5,
  },
  reservationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reserverInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  reserverAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FFF",
  },
  alertBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  alertBtnText: {
    fontSize: 9,
    marginLeft: 6,
    fontWeight: "800",
  },
  mainCta: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  ctaText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
});

export default GiftCardHome;
