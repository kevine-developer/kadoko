import { StyleSheet, Text, type TextProps, Platform } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Fonts, Colors } from "@/constants/theme";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  colorName?: keyof typeof Colors.light;
  bold?: boolean;
  weight?: "normal" | "medium" | "semibold" | "bold" | "heavy";
  type?:
    | "default"
    | "hero"
    | "title"
    | "subtitle"
    | "label"
    | "caption"
    | "link";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  colorName,
  type = "default",
  bold = false,
  weight,
  ...rest
}: ThemedTextProps) {
  const defaultKey = type === "link" ? "accent" : "textMain";
  const color = useThemeColor(
    { light: lightColor, dark: darkColor },
    colorName ?? defaultKey,
  );

  const fontWeightStyle = weight
    ? stylesWeight[weight]
    : bold
      ? stylesWeight.bold
      : {};

  return (
    <Text
      style={[
        { color },
        styles.base,
        styles[type],
        fontWeightStyle, 
        style,
      ]}
      {...rest}
    />
  );
}

// Séparation des graisses pour plus de clarté
const stylesWeight = StyleSheet.create({
  normal: { fontWeight: "400" },
  medium: { fontWeight: "500" },
  semibold: { fontWeight: "600" },
  bold: { fontWeight: Platform.OS === "ios" ? "700" : "bold" },
  heavy: { fontWeight: "900" },
});

const styles = StyleSheet.create({
  base: {
    fontFamily: Fonts.sans,
  },
  hero: {
    fontSize: 32,
    lineHeight: 48,
    fontFamily: Fonts.serif,
    letterSpacing: -1,
  },
  title: {
    fontSize: 24,
    lineHeight: 38,
    fontFamily: Fonts.serif,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts.serif,
    fontStyle: "italic",
  },
  label: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  default: {
    fontSize: 15,
    lineHeight: 24,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
  },
  link: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
