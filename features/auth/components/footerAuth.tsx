import { StyleSheet, Text, TouchableOpacity, View, Platform } from "react-native";
import React from "react";
import { Link, LinkProps } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

// --- THEME ÉDITORIAL COHÉRENT ---
const THEME = {
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062", // Or brossé
};

interface FooterAuthProps {
  textIntro: string;
  textLink: string;
  link: LinkProps["href"];
}

const FooterAuth = ({ textIntro, textLink, link }: FooterAuthProps) => {
  const insets = useSafeAreaInsets();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={[styles.footer, { paddingBottom: insets.bottom + 25 }]}>
      {/* Texte d'introduction style "Manuscrit" */}
      <Text style={styles.footerText}>{textIntro}</Text>
      
      <Link href={link} asChild>
        <TouchableOpacity 
          activeOpacity={0.7} 
          onPress={handlePress}
          style={styles.linkWrapper}
        >
          {/* Lien style "Label Boutique" */}
          <Text style={styles.footerLink}>{textLink.toUpperCase()}</Text>
          <View style={styles.underline} />
        </TouchableOpacity>
      </Link>
    </View>
  );
};

export default FooterAuth;

const styles = StyleSheet.create({
  footer: {
    flexDirection: "column", // Stacké pour plus d'élégance éditoriale
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: THEME.textSecondary,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontStyle: "italic", // Italique pour le côté "Confidence"
  },
  linkWrapper: {
    alignItems: "center",
  },
  footerLink: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.accent,
    letterSpacing: 1.5, // Espacement luxueux
  },
  underline: {
    height: 1,
    width: '40%', // Ligne courte et centrée sous le lien
    backgroundColor: THEME.accent,
    marginTop: 4,
    opacity: 0.3,
  },
});