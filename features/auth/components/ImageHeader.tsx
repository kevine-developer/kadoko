import { StyleSheet, View, Platform, Dimensions, Text } from "react-native";
import React from "react";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { useAppTheme } from "@/hooks/custom/use-app-theme";

interface ImageHeaderProps {
  imageBackground?: string;
}

const ImageHeader = ({ imageBackground }: ImageHeaderProps) => {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

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
        transition={1000}
      />

      <View style={styles.overlay} />

      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "timing", duration: 1000 }}
        style={[styles.brandContainer, { top: insets.top + 40 }]}
      >
        <Text style={[styles.brandText, { color: "#FFFFFF" }]}>Kadô-Kou</Text>
        <View style={[styles.logoDivider, { backgroundColor: theme.accent }]} />
        <Text style={[styles.brandTagline, { color: "#FFFFFF" }]}>
          EST. 2024
        </Text>
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
    height: "100%",
    backgroundColor: "#1A1A1A",
  },
  headerImage: {
    width: "100%",
    height: "100%",
    opacity: 0.85,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  brandContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    fontSize: 22,
    fontWeight: "300",
    letterSpacing: 10,
    textAlign: "center",
    marginLeft: 10,
  },
  brandItalic: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontStyle: "italic",
    fontWeight: "400",
  },
  logoDivider: {
    width: 20,
    height: 1,
    marginVertical: 10,
    opacity: 0.8,
  },
  brandTagline: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 3,
    opacity: 0.6,
  },
});
