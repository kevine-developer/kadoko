import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ImageHeaderProps {
  imageBackground?: string;
}

const ImageHeader = ({ imageBackground }: ImageHeaderProps) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.headerImageContainer}>
      <Image
        source={{
          uri:
            imageBackground ||
            "https://plus.unsplash.com/premium_photo-1672233867062-64af815416dd?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        }}
        style={styles.headerImage}
        contentFit="cover"
        transition={500}
      />
      {/* Overlay pour le contraste */}
      <View style={styles.overlay} />

      {/* Logo / Marque discret en haut */}
      <View style={[styles.brandContainer, { top: insets.top + 20 }]}>
        <Text style={styles.brandText}>
          GIFT<Text style={{ fontStyle: "italic" }}>FLOW</Text>
        </Text>
      </View>
    </View>
  );
};

export default ImageHeader;

const styles = StyleSheet.create({
  /* --- HEADER IMAGE --- */
  headerImageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "54%", // Prend un peu plus de la moitié
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)", // Léger filtre sombre pour le texte brand
  },
  brandContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  brandText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 4,
  },
});
