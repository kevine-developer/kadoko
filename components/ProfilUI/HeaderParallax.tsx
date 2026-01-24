import { Animated, StyleSheet, View, Dimensions, Platform } from "react-native";
import React from "react";

const { width } = Dimensions.get("window");

const HeaderParallax = ({ user, headerOpacity, imageScale }: any) => {
  return (
    <Animated.View style={[styles.headerContainer, { opacity: headerOpacity }]}>
      <Animated.Image
        source={{
          uri:
            user?.image ||
            "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=400&fit=crop&q=60",
        }}
        style={[styles.headerImage, { transform: [{ scale: imageScale }] }]}
        blurRadius={Platform.OS === "ios" ? 10 : 5} // Effet de profondeur luxe
      />
      {/* Overlay pour assombrir légèrement et assurer la lisibilité */}
      <View style={styles.headerOverlay} />

      {/* Dégradé qui fond l'image dans le fond Bone Silk (#FDFBF7) */}
      <View style={styles.bottomGradient} />
    </Animated.View>
  );
};

export default HeaderParallax;

const styles = StyleSheet.create({
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: "#FDFBF7",
    overflow: "hidden",
  },
  headerImage: {
    width: width,
    height: "100%",
    opacity: 0.4, // Très subtil
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(253, 251, 247, 0.2)", // Teinte crème
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    // On simule un dégradé vers le fond de l'app
    backgroundColor: "transparent",
    borderBottomWidth: 150,
    borderBottomColor: "#FDFBF7",
    opacity: 0.9,
  },
});
