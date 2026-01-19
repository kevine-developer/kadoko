import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useRef } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// --- THEME ---
const THEME = {
  textMain: "#111827",
  white: "#FFFFFF",
  glass: "rgba(255,255,255,0.15)",
  glassBorder: "rgba(255,255,255,0.2)",
};

interface CreateWishlistBannerProps {
  onPress: () => void;
}

export default function CreateWishlistBanner({ onPress }: CreateWishlistBannerProps) {
  // Animation de pression (Scale)
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.card}
      >
        {/* 1. BACKGROUND IMAGE (Abstrait / Luxe) */}
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?q=80&w=2788&auto=format&fit=crop" }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={500}
        />
        
        {/* 2. DARK OVERLAY (Pour la lisibilité) */}
        <View style={styles.overlay} />

        {/* 3. CONTENU */}
        <View style={styles.content}>
          <View style={styles.badgeContainer}>
            <View style={styles.dot} />
            <Text style={styles.badgeText}>COMMENCER</Text>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>
              Créez votre première collection.
            </Text>
            <Text style={styles.subtitle}>
              Rassemblez vos envies et partagez-les avec votre cercle proche.
            </Text>
          </View>

          <View style={styles.actionRow}>
            <View style={styles.ctaButton}>
              <Text style={styles.ctaText}>Créer maintenant</Text>
              <Ionicons name="arrow-forward" size={16} color={THEME.textMain} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 20, // Marge latérale par rapport à l'écran
    marginBottom: 32,
    marginTop: 16,
  },
  card: {
    height: 230,
    width: "100%",
    borderRadius: 28,
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
    // Ombre profonde pour l'effet "Hero"
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  
  /* OVERLAY */
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)", // Assombrit l'image
  },

  /* CONTENT */
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
  },
  
  /* BADGE */
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: THEME.glass,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.glassBorder,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981", // Vert émeraude
  },
  badgeText: {
    color: THEME.white,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },

  /* TEXTS */
  textContainer: {
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    color: THEME.white,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    lineHeight: 34,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 20,
    maxWidth: "90%",
  },

  /* CTA BUTTON */
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 12,
  },
  ctaButton: {
    backgroundColor: THEME.white,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24, // Pill shape
  },
  ctaText: {
    color: THEME.textMain, // Texte noir sur bouton blanc
    fontSize: 14,
    fontWeight: "700",
  },
});