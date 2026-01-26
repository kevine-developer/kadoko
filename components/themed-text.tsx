// components/themed-text.tsx
import { StyleSheet, Text, type TextProps, Platform } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Fonts, Colors } from "@/constants/theme";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  // On permet de passer une clé de couleur (ex: "textSecondary")
  colorName?: keyof typeof Colors.light;
  type?:
    | "default"
    | "hero"
    | "title"
    | "subtitle"
    | "label"
    | "caption"
    | "link"
    | "defaultBold";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  colorName,
  type = "default",
  ...rest
}: ThemedTextProps) {

  const defaultKey = type === "link" ? "accent" : "textMain";
  const color = useThemeColor(
    { light: lightColor, dark: darkColor },
    colorName ?? defaultKey,
  );

  return (
    <Text style={[{ color }, styles.base, styles[type], style]} {...rest} />
  );
}

const styles = StyleSheet.create({
  base: { fontFamily: Fonts.sans },
  hero: {
    fontSize: 42,
    lineHeight: 48,
    fontFamily: Fonts.serif,
    letterSpacing: -1,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontFamily: Fonts.serif,
    fontWeight: Platform.OS === "ios" ? "500" : "bold",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts.serif,
    fontStyle: "italic",
  },
  label: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  default: { fontSize: 14, lineHeight: 24, fontWeight: "400" },
  defaultBold: { fontSize: 14, lineHeight: 24, fontWeight: 700 },
  caption: { fontSize: 13, lineHeight: 18 },
  link: { fontSize: 14, fontWeight: "700", textDecorationLine: "underline" },
});
