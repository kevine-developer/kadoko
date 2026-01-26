import { Animated, StyleSheet, View, Platform } from "react-native";
import React from "react";
import { useAppTheme } from "@/hooks/custom/use-app-theme";

const HeaderParallax = ({ user, headerOpacity, imageScale }: any) => {
  const theme = useAppTheme();

  return (
    <Animated.View
      style={[
        styles.headerContainer,
        { opacity: headerOpacity, backgroundColor: theme.background },
      ]}
    >
      <Animated.Image
        source={{
          uri:
            user?.image ||
            "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=400&fit=crop&q=60",
        }}
        style={[styles.headerImage, { transform: [{ scale: imageScale }] }]}
        blurRadius={Platform.OS === "ios" ? 10 : 5}
      />
      <View style={styles.headerOverlay} />
      <View
        style={[styles.bottomGradient, { borderBottomColor: theme.background }]}
      />
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
    height: 270,
    overflow: "hidden",
  },
  headerImage: {
    width: "100%",
    height: "100%",
    opacity: 0.4,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(253, 251, 247, 0.2)",
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: "transparent",
    borderBottomWidth: 150,
    opacity: 0.9,
  },
});
