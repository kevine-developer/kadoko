import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useState, useEffect } from "react";
import {
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { MotiView, AnimatePresence } from "moti";

// --- THEME ---
const THEME = {
  background: "#FDFBF7", // Bone Silk (Léger & Aérien)
  surface: "#FFFFFF",
  textMain: "#1A1A1A", // Charcoal pour contraste
  textSecondary: "#8E8E93",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.08)",
};

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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState("14:32:10");

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
      // Logique d'ajout à une liste temporaire
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>EXPIRATION</Text>
          <Text style={styles.timerValue}>{timeLeft}</Text>
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
              style={styles.cardContainer}
            >
              {/* IMAGE IMMERSIVE */}
              <View style={styles.imageFrame}>
                <Image
                  source={{ uri: currentItem.image }}
                  style={styles.image}
                  contentFit="cover"
                />
                <View style={styles.indexBadge}>
                  <Text style={styles.indexText}>
                    {currentIndex + 1} / {DAILY_DROPS.length}
                  </Text>
                </View>
              </View>

              {/* DETAILS */}
              <View style={styles.details}>
                <View style={styles.divider} />
                <Text style={styles.brand}>{currentItem.brand}</Text>
                <Text style={styles.name} numberOfLines={2}>
                  {currentItem.name}
                </Text>
                <Text style={styles.price}>{currentItem.price}</Text>
              </View>

              {/* ACTIONS (Choix binaire addictif) */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.passBtn}
                  onPress={() => handleAction("PASS")}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={THEME.textSecondary}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={() => handleAction("SAVE")}
                  activeOpacity={0.8}
                  disabled={true}
                >
                  <Text style={styles.saveText}>BIENTÔT</Text>
                </TouchableOpacity>
              </View>
            </MotiView>
          </AnimatePresence>
        ) : (
          /* ÉCRAN DE FIN (La boucle est bouclée) */
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={styles.endScreen}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="checkmark" size={40} color={THEME.accent} />
            </View>
            <Text style={styles.endTitle}>Sélection terminée.</Text>
            <Text style={styles.endSubtitle}>
              Revenez demain pour découvrir 3 nouvelles pièces d&apos;exception.
            </Text>
          </MotiView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: "center",
    justifyContent: "center",
  },
  timerContainer: {
    alignItems: "center",
  },
  timerLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: THEME.accent,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  timerValue: {
    fontSize: 14,
    color: THEME.textMain,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },

  /* CONTENT */
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40,
  },

  /* CARD */
  cardContainer: {
    width: width * 0.88,
    height: height * 0.72,
    backgroundColor: THEME.surface,
    alignItems: "center",
    borderRadius: 0,
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 3,
  },
  imageFrame: {
    width: "100%",
    height: "62%",
    backgroundColor: "#F2F2F7",
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
    backgroundColor: "rgba(253, 251, 247, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  indexText: {
    color: THEME.textMain,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },

  /* DETAILS */
  details: {
    width: "100%",
    padding: 25,
    alignItems: "center",
  },
  divider: {
    width: 30,
    height: 2,
    backgroundColor: THEME.accent,
    marginBottom: 20,
  },
  brand: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 2,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  name: {
    fontSize: 26,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 32,
  },
  price: {
    fontSize: 16,
    fontWeight: "400",
    color: THEME.accent,
    fontStyle: "italic",
  },

  /* ACTIONS */
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
    borderColor: THEME.border,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtn: {
    flex: 1,
    height: 60,
    backgroundColor: THEME.textMain,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.1, // Désactivé élégamment
  },
  saveText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  /* END SCREEN */
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
    borderColor: THEME.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  endTitle: {
    fontSize: 32,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    marginBottom: 15,
  },
  endSubtitle: {
    fontSize: 14,
    color: THEME.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 50,
  },
  goBackBtn: {
    borderBottomWidth: 1,
    borderBottomColor: THEME.textMain,
    paddingBottom: 5,
  },
  goBackText: {
    color: THEME.textMain,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
});
