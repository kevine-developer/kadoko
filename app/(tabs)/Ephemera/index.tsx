import { Image } from "expo-image";
import React, { useState, useEffect } from "react";
import {
  Dimensions,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { MotiView, AnimatePresence } from "moti";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";

const { width, height } = Dimensions.get("window");

// --- DATA MOCK ---
const DAILY_DROPS = [
  {
    id: "1",
    brand: "AUDEMARS PIGUET",
    name: "Royal Oak 'Jumbo'",
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1000",
    price: "Sur demande",
  },
  {
    id: "2",
    brand: "RIMOWA",
    name: "Classic Cabin Aluminium",
    image:
      "https://images.unsplash.com/photo-1565058784076-234b6eb0639d?q=80&w=1000",
    price: "1 150 €",
  },
  {
    id: "3",
    brand: "DYSON",
    name: "V15 Detect Absolute",
    image:
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1000",
    price: "799 €",
  },
];

export default function EphemeralScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState("00:00:00");

  // Timer factice pour l'effet d'urgence
  useEffect(() => {
    const timer = setInterval(() => {
      const date = new Date();
      const h = 23 - date.getHours();
      const m = 59 - date.getMinutes();
      const s = 59 - date.getSeconds();
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAction = (action: "SAVE" | "PASS") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (action === "SAVE") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    if (currentIndex < DAILY_DROPS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const currentItem = DAILY_DROPS[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.timerContainer}>
          <ThemedText type="label" colorName="accent" style={styles.timerLabel}>
            EXPIRATION
          </ThemedText>
          <ThemedText type="default" bold style={styles.timerValue}>
            {timeLeft}
          </ThemedText>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {!isFinished ? (
          <AnimatePresence exitBeforeEnter>
            <MotiView
              key={currentItem.id}
              from={{ opacity: 0, scale: 0.95, translateY: 20 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ type: "timing", duration: 500 }}
              style={[
                styles.cardContainer,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              {/* IMAGE IMMERSIVE */}
              <View
                style={[styles.imageFrame, { backgroundColor: theme.surface }]}
              >
                <Image
                  source={{ uri: currentItem.image }}
                  style={styles.image}
                  contentFit="cover"
                />
                <View
                  style={[
                    styles.indexBadge,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <ThemedText type="label" style={styles.indexText}>
                    {currentIndex + 1} / {DAILY_DROPS.length}
                  </ThemedText>
                </View>
              </View>

              {/* DETAILS */}
              <View style={styles.details}>
                <View
                  style={[styles.divider, { backgroundColor: theme.accent }]}
                />
                <ThemedText
                  type="label"
                  colorName="textSecondary"
                  style={styles.brand}
                >
                  {currentItem.brand}
                </ThemedText>
                <ThemedText type="title" style={styles.name} numberOfLines={2}>
                  {currentItem.name}
                </ThemedText>
                <ThemedText
                  type="subtitle"
                  colorName="accent"
                  style={styles.price}
                >
                  {currentItem.price}
                </ThemedText>
              </View>

              {/* ACTIONS */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.passBtn, { borderColor: theme.border }]}
                  onPress={() => handleAction("PASS")}
                  activeOpacity={0.7}
                >
                  <ThemedIcon
                    name="close"
                    size={24}
                    colorName="textSecondary"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.saveBtn,
                    { backgroundColor: theme.textMain, opacity: 0.1 },
                  ]}
                  onPress={() => handleAction("SAVE")}
                  activeOpacity={0.8}
                  disabled={true}
                >
                  <ThemedText type="label" style={{ color: theme.background }}>
                    BIENTÔT
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </MotiView>
          </AnimatePresence>
        ) : (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={styles.endScreen}
          >
            <View style={[styles.iconCircle, { borderColor: theme.accent }]}>
              <ThemedIcon name="checkmark" size={40} colorName="accent" />
            </View>
            <ThemedText type="hero" style={styles.endTitle}>
              Sélection terminée.
            </ThemedText>
            <ThemedText
              type="default"
              colorName="textSecondary"
              style={styles.endSubtitle}
            >
              Revenez demain pour découvrir 3 nouvelles pièces d&apos;exception.
            </ThemedText>
          </MotiView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  timerContainer: {
    alignItems: "center",
  },
  timerLabel: {
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  timerValue: {
    fontVariant: ["tabular-nums"],
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40,
  },
  cardContainer: {
    width: width * 0.88,
    height: height * 0.72,
    alignItems: "center",
    borderRadius: 0,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 3,
  },
  imageFrame: {
    width: "100%",
    height: "62%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  indexBadge: {
    position: "absolute",
    top: 15,
    right: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  indexText: {
    letterSpacing: 1,
  },
  details: {
    width: "100%",
    padding: 25,
    alignItems: "center",
  },
  divider: {
    width: 30,
    height: 2,
    marginBottom: 20,
  },
  brand: {
    letterSpacing: 2,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  name: {
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 32,
  },
  price: {
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 20,
    marginTop: "auto",
    gap: 15,
    marginBottom: 20,
  },
  passBtn: {
    width: 60,
    height: 60,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtn: {
    flex: 1,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  endScreen: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  endTitle: {
    marginBottom: 15,
  },
  endSubtitle: {
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 50,
  },
});
