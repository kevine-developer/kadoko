import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { Link, LinkProps } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/themed-text";

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
      <ThemedText
        type="default"
        colorName="textSecondary"
        style={styles.footerText}
      >
        {textIntro}
      </ThemedText>

      <Link href={link} asChild>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handlePress}
        >
          <ThemedText type="label" colorName="accent" style={styles.footerLink}>
            {textLink.toUpperCase()}
          </ThemedText>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

export default FooterAuth;

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    marginTop: 30,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  footerText: {
    fontSize: 14,
  },

  footerLink: {
    fontSize: 11,
    letterSpacing: 1.5,
    textDecorationLine: "underline"
  },
});
