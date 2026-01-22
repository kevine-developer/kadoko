import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Link, LinkProps } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const THEME = {
  primary: "#111827",
  textSecondary: "#6B7280",
};

interface FooterAuthProps {
  textIntro: string;
  textLink: string;
  link: LinkProps["href"];
}

const FooterAuth = ({ textIntro, textLink, link }: FooterAuthProps) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
      <Text style={styles.footerText}>{textIntro} </Text>
      <Link href={link} asChild>
        <TouchableOpacity activeOpacity={0.9}>
          <Text style={styles.footerLink}>{textLink}</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

export default FooterAuth;

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: THEME.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.primary,
    textDecorationLine: "underline",
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
});
