import { Animated, StyleSheet, View } from "react-native";
import React from "react";

interface HeaderParallaxProps {
  user: any;
  headerOpacity: any;
  imageScale: any;
}

const HeaderParallax = ({
  user,
  headerOpacity,
  imageScale,
}: HeaderParallaxProps) => {
  return (
    <Animated.View style={[styles.headerContainer, { opacity: headerOpacity }]}>
      <Animated.Image
        source={{
          uri:
            user?.image ||
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800",
        }}
        style={[styles.headerImage, { transform: [{ scale: imageScale }] }]}
      />
      <View style={styles.headerOverlay} />
      {/* Dégradé pour fondre avec la carte */}
      <View style={styles.headerGradient} />
    </Animated.View>
  );
};

export default HeaderParallax;

const styles = StyleSheet.create({
  /* --- HEADER --- */
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 240,
    backgroundColor: "#111827",
  },
  headerImage: {
    width: "100%",
    height: "100%",
    opacity: 0.7,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  headerGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: "transparent",
  },
});
