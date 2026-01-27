import {
  Animated,
  Dimensions,
  FlatList,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useIsFirstLaunch } from "@/hooks/use-is-first-launch";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useRef, useState } from "react";

import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";

// --- THEME ---

const { width, height } = Dimensions.get("window");

// --- DATA ---
const SLIDES = [
  {
    id: "1",
    title: "L'Art d'Offrir.",
    description:
      "Créez des collections d'envies uniques et rassemblez vos inspirations en un seul endroit élégant.",
    // Image: Minimalist aesthetic object
    image:
      "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "2",
    title: "Cercle Privé.",
    description:
      "Partagez vos listes avec votre cercle proche. Fini les doublons, place aux surprises parfaites.",
    // Image: Friends / Lifestyle
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "3",
    title: "GiftFlow.",
    description:
      "Simplifiez chaque occasion. Rejoignez une nouvelle expérience du cadeau.",
    // Image: Unboxing / Happiness
    image:
      "https://images.unsplash.com/photo-1512909006721-3d6018887383?q=80&w=1000&auto=format&fit=crop",
  },
];

// --- COMPOSANT ITEM (SLIDE) ---
const SlideItem = ({ item }: { item: (typeof SLIDES)[0] }) => {
  return (
    <View style={styles.slideContainer}>
      <Image
        source={{ uri: item.image }}
        style={styles.image}
        contentFit="cover"
        transition={500}
      />
      <View style={styles.overlay} />

      <View style={styles.textContainer}>
        <ThemedText type="hero" style={styles.title}>
          {item.title}
        </ThemedText>
        <ThemedText type="subtitle" style={styles.description}>
          {item.description}
        </ThemedText>
      </View>
    </View>
  );
};

// --- ECRAN PRINCIPAL ---
export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Gestion du scroll pour les points de pagination
  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      completeOnboarding();
    }
  };
  const { setHasLaunched } = useIsFirstLaunch();

  const completeOnboarding = async () => {
    await setHasLaunched();
    // Redirection vers Auth ou Home
    router.push("/(auth)/sign-up");
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* LISTE DES SLIDES */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={({ item }) => <SlideItem item={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      {/* HEADER NAVIGATION (Skip) */}
      <View style={[styles.topBar, { top: insets.top }]}>
        <View style={styles.logoContainer}>
          <ThemedText type="label" style={styles.logoText}>
            GIFT
            <ThemedText type="label" style={{ fontStyle: "italic" }}>
              FLOW
            </ThemedText>
          </ThemedText>
        </View>

        {currentIndex < SLIDES.length - 1 && (
          <TouchableOpacity onPress={completeOnboarding} style={styles.skipBtn}>
            <ThemedText type="caption" style={styles.skipText}>
              Passer
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {/* FOOTER NAVIGATION */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        {/* PAGINATION (DOTS) */}
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => {
            const isActive = index === currentIndex;
            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  isActive ? styles.dotActive : styles.dotInactive,
                ]}
              />
            );
          })}
        </View>

        {/* BOUTON D'ACTION */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.textMain }]}
          activeOpacity={0.9}
          onPress={handleNext}
        >
          <ThemedText
            type="defaultBold"
            style={[styles.actionBtnText, { color: theme.background }]}
          >
            {currentIndex === SLIDES.length - 1 ? "Commencer" : "Suivant"}
          </ThemedText>
          <ThemedIcon name="arrow-forward" size={18} color={theme.background} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  /* SLIDE */
  slideContainer: {
    width: width,
    height: height,
    justifyContent: "flex-end", // Texte en bas
    paddingBottom: 200, // Espace pour le footer
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)", // Assombrir pour le texte blanc
    // Optionnel : Ajouter un LinearGradient ici pour un fondu plus pro en bas
  },
  textContainer: {
    paddingHorizontal: 32,
  },
  title: {
    color: "#FFFFFF",
    lineHeight: 48,
    marginBottom: 16,
  },
  description: {
    color: "#E5E5E5",
    maxWidth: "90%",
  },

  /* TOP BAR */
  topBar: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  logoContainer: {
    // Optionnel
  },
  logoText: {
    color: "#FFFFFF",
    letterSpacing: 2,
  },
  skipBtn: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    paddingHorizontal: 16,
    backdropFilter: "blur(10px)",
  },
  skipText: {
    color: "#FFFFFF",
  },

  /* FOOTER */
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  /* PAGINATION */
  pagination: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 24, // Pillule allongée pour l'actif
    backgroundColor: "#FFFFFF",
  },
  dotInactive: {
    width: 6, // Cercle pour les inactifs
    backgroundColor: "rgba(255,255,255,0.4)",
  },

  /* ACTION BUTTON */
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  actionBtnText: {},
});
