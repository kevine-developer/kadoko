import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ActionCardsButton from "./ActionCards";

const COLORS = {
  primary: "#24882cff",
  primaryLight: "#F5F3FF",
  textMain: "#111827",
  textMuted: "#9CA3AF",
  white: "#FFFFFF",
  gray: "#E5E7EB",
  grayDark: "#6B7280",
  danger: "#EF4444",
};

export default function CardPurchasedGift({
  title,
  recipient,
  image,
  reservedDate,
  purchaseDate,
  links,
  onPurchased,
  onUnreserve,
}: any) {
  const [timeRemaining, setTimeRemaining] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  const [isConfirming, setIsConfirming] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isConfirming && countdown > 0) {
      timerRef.current = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (isConfirming && countdown === 0) {
      setIsConfirming(false);
      onPurchased();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isConfirming, countdown, onPurchased]);

  useEffect(() => {
    if (!reservedDate) return;

    const calculateTimeRemaining = () => {
      const now = new Date();
      const event = new Date(reservedDate);
      const diff = event.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("Aujourd'hui");
        setIsUrgent(true);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );

      setIsUrgent(days < 3);

      if (days > 0) {
        setTimeRemaining(`${days}j restant${days > 1 ? "s" : ""}`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h restante${hours > 1 ? "s" : ""}`);
      } else {
        setTimeRemaining("Aujourd'hui");
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000);

    return () => clearInterval(interval);
  }, [reservedDate]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const formatPurchaseDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.row}
      >
        <View style={styles.imageContainer}>
          <Image
            source={image}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
        </View>

        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            {timeRemaining && (
              <View style={[styles.badge, isUrgent && styles.urgentBadge]}>
                <Ionicons
                  name="time-outline"
                  size={12}
                  color={isUrgent ? "#DC2626" : COLORS.primary}
                />
                <Text
                  style={[styles.countdownText, isUrgent && styles.urgentText]}
                >
                  {timeRemaining}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.infoBox}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="person-outline"
                size={14}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.label}>Pour</Text>
              <Text style={styles.val} numberOfLines={1}>
                {recipient}
              </Text>
            </View>
            {purchaseDate && (
              <View style={styles.purchaseDateContainer}>
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={COLORS.textMuted}
                />
                <Text style={styles.purchaseDateText}>
                  Acheté le {formatPurchaseDate(purchaseDate)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.actions}>
            <View style={styles.actionButtons}>
              {!isConfirming && (
                <ActionCardsButton
                  icon="arrow-undo-outline"
                  text="Remettre dans réserver"
                  onPress={onUnreserve}
                  variant="secondary"
                />
              )}
              {isConfirming ? (
                <ActionCardsButton
                  icon="close-circle-outline"
                  text={`Annuler (${countdown}s)`}
                  onPress={() => {
                    setIsConfirming(false);
                    if (timerRef.current) clearTimeout(timerRef.current);
                  }}
                  variant="danger"
                />
              ) : (
                <ActionCardsButton
                  icon="archive-outline"
                  text="Archivé"
                  onPress={() => {
                    setCountdown(10);
                    setIsConfirming(true);
                  }}
                  variant="primary"
                />
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const shadow = (
  color: string,
  opacity: number,
  radius: number,
  elev: number
) => ({
  ...Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: { elevation: elev },
  }),
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    ...shadow("#000", 0.08, 12, 4),
  },
  row: {
    flexDirection: "row",
    padding: 8,
  },
  content: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "space-between",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 5,
  },
  imageContainer: {
    width: 100,
    height: 130,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: COLORS.primaryLight,
    ...shadow("#000", 0.1, 8, 3),
  },
  image: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textMain,
    marginBottom: 8,
    lineHeight: 22,
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 6,
    borderRadius: 12,
    marginBottom: 8,
    gap: 10,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  infoContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  label: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "500",
    marginBottom: 1,
  },
  val: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMain,
  },
  purchaseDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  purchaseDateText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#545554da",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    flex: 1,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  urgentBadge: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5",
  },
  countdownText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.primary,
  },
  urgentText: {
    color: "#DC2626",
  },
});
