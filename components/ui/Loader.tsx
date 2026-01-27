import React from "react";
import { View, StyleSheet } from "react-native";
import { MotiView } from "moti";
import { Easing } from "react-native-reanimated";
import { useAppTheme } from "@/hooks/custom/use-app-theme";

interface LoaderProps {
  size?: "small" | "medium" | "large";
}

export const Loader = ({ size = "medium" }: LoaderProps) => {
  const theme = useAppTheme();

  const dimensions = {
    small: 30,
    medium: 50,
    large: 80,
  };

  const loaderSize = dimensions[size];
  const strokeWidth = size === "large" ? 2 : 1.5;

  return (
    <View style={styles.container}>
      <View
        style={{
          width: loaderSize,
          height: loaderSize,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Anneau extérieur : Discret, effet "Silk" */}
        <MotiView
          from={{ opacity: 0.2, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1.1 }}
          transition={{
            type: "timing",
            duration: 2000,
            loop: true,
            repeatReverse: true,
            easing: Easing.inOut(Easing.ease),
          }}
          style={[
            styles.outerRing,
            {
              width: loaderSize,
              height: loaderSize,
              borderRadius: loaderSize / 2,
              borderColor: theme.border,
              borderWidth: 1,
            },
          ]}
        />

        {/* Losange Central : L'élément "Signature" (Or Brossé) */}
        <MotiView
          from={{
            rotate: "45deg",
            scale: 0.9,
            opacity: 0.6,
          }}
          animate={{
            rotate: "225deg", // Rotation lente de 180 degrés
            scale: 1,
            opacity: 1,
          }}
          transition={{
            type: "timing",
            duration: 2500,
            loop: true,
            repeatReverse: true,
            easing: Easing.inOut(Easing.quad),
          }}
          style={[
            styles.diamond,
            {
              width: loaderSize * 0.45,
              height: loaderSize * 0.45,
              borderColor: theme.accent,
              borderWidth: strokeWidth,
            },
          ]}
        />

        {/* Point central fixe : Stabilité et focus */}
        <View
          style={[
            styles.centerDot,
            {
              backgroundColor: theme.accent,
              width: strokeWidth * 2,
              height: strokeWidth * 2,
              borderRadius: strokeWidth,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  outerRing: {
    position: "absolute",
  },
  diamond: {
    position: "absolute",
    backgroundColor: "transparent",
    // Pas d'arrondi ou très léger pour garder l'aspect architectural
    borderRadius: 2,
    shadowColor: "#AF9062",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  centerDot: {
    position: "absolute",
    opacity: 0.8,
  },
});
