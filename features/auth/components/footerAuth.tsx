import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { Link, LinkProps } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";

interface FooterAuthProps {
  textIntro: string;
  textLink: string;
  link: LinkProps["href"];
}

const FooterAuth = ({ textIntro, textLink, link }: FooterAuthProps) => {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={[styles.footer, { paddingBottom: insets.bottom + 25 }]}>
      <ThemedText
        type="subtitle"
        colorName="textSecondary"
        style={styles.footerText}
      >
        {textIntro}
      </ThemedText>

      <Link href={link} asChild>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handlePress}
          style={styles.linkWrapper}
        >
          <ThemedText type="label" colorName="accent" style={styles.footerLink}>
            {textLink.toUpperCase()}
          </ThemedText>
          <View style={[styles.underline, { backgroundColor: theme.accent }]} />
        </TouchableOpacity>
      </Link>
    </View>
  );
};

export default FooterAuth;

const styles = StyleSheet.create({
  footer: {
    flexDirection: "column",
    gap: 8,
    marginTop: 20,
    width: "100%",
  },
  footerText: {
    fontSize: 14,
    width: "100%",
    textAlign: "center",
  },
  linkWrapper: {
    alignItems: "center",
  },
  footerLink: {
    fontSize: 11,
    letterSpacing: 1.5,
  },
  underline: {
    height: 1,
    width: "40%",
    marginTop: 4,
    opacity: 0.3,
  },
});
