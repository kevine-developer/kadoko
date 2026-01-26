import { StyleSheet, Text, View, Platform, Dimensions } from "react-native";
import React from "react";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";

// --- THEME ÉDITORIAL COHÉRENT ---
const THEME = {
  background: "#FDFBF7", // Bone Silk
  textMain: "#FFFFFF",
  accent: "#AF9062", // Or brossé
};

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ImageHeaderProps {
  imageBackground?: string;
}

const ImageHeader = ({ imageBackground }: ImageHeaderProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.headerImageContainer}>
      {/* 1. IMAGE DE COUVERTURE AVEC TRANSITION DOUCE */}
      <Image
        source={{
          uri:
            imageBackground ||
            "https://plus.unsplash.com/premium_photo-1672233867062-64af815416dd?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        }}
        style={styles.headerImage}
        contentFit="cover"
        transition={1000}
      />

      {/* 2. OVERLAY ARTISTIQUE (Vignette) */}
      <View style={styles.overlay} />

      {/* 3. LOGO TYPE "MAISON DE LUXE" */}
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "timing", duration: 1000 }}
        style={[styles.brandContainer, { top: insets.top + 40 }]}
      >
        <Text style={styles.brandText}>
          GIFT<Text style={styles.brandItalic}>FLOW</Text>
        </Text>
        <View style={styles.logoDivider} />
        <Text style={styles.brandTagline}>EST. 2024</Text>
      </MotiView>
    </View>
  );
};

export default ImageHeader;

const styles = StyleSheet.create({
  headerImageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%", // 55% de l'écran pour l'aspect immersif
    backgroundColor: "#1A1A1A",
  },
  headerImage: {
    width: "100%",
    height: "100%",
    opacity: 0.85,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)", // Filtre cinématographique léger
  },
  brandContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    color: THEME.textMain,
    fontSize: 22,
    fontWeight: "300",
    letterSpacing: 10, // Espacement extrême style "Vogue"
    textAlign: "center",
    marginLeft: 10, // Pour compenser le letterSpacing final
  },
  brandItalic: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontStyle: "italic",
    fontWeight: "400",
  },
  logoDivider: {
    width: 20,
    height: 1,
    backgroundColor: THEME.accent,
    marginVertical: 10,
    opacity: 0.8,
  },
  brandTagline: {
    color: THEME.textMain,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 3,
    opacity: 0.6,
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    // On simule un dégradé vers le fond Bone Silk du formulaire
    backgroundColor: "transparent",
    borderBottomWidth: 150,
    borderBottomColor: "#FDFBF7",
    opacity: 1,
  },
});
