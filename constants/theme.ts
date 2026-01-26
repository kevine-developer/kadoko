import { Platform } from "react-native";

// --- 1. PALETTE DE COULEURS BRUTES ---
// On définit les couleurs une seule fois ici pour éviter la répétition.
const palette = {
  boneSilk: "#FDFBF7",
  white: "#FFFFFF",
  deepBlack: "#1A1A1A",
  charcoal: "#2C2C2C",
  coolGrey: "#8E8E93",
  brushedGold: "#AF9062",
  brushedGoldLight: "#C8A97E", // Or plus clair pour le Dark Mode
  brickRed: "#C34A4A",
  forestGreen: "#4A6741",

};

// --- 2. THEME : LIGHT & DARK MODE ---
export const Colors = {
  light: {
    // Arrière-plans
    background: palette.boneSilk,
    surface: palette.white,

    // Textes
    textMain: palette.deepBlack,
    textSecondary: palette.coolGrey,

    // Actions & Accents
    primary: palette.deepBlack, // Utilisé pour les boutons principaux
    accent: palette.brushedGold, // L'or pour les icônes, loaders, dividers

    // États
    border: "rgba(0,0,0,0.06)", // Hairline subtile
    danger: palette.brickRed,
    success: palette.forestGreen,

    // Navigation (Tabs)
    tabIconDefault: palette.coolGrey,
    tabIconSelected: palette.deepBlack,
  },
  dark: {
    // Arrière-plans (Inversion Luxe)
    background: palette.deepBlack,
    surface: palette.charcoal,

    // Textes
    textMain: palette.boneSilk,
    textSecondary: palette.coolGrey,

    // Actions & Accents
    primary: palette.boneSilk, // Boutons blancs sur fond noir
    accent: palette.brushedGoldLight, // Or un peu plus clair pour contraster

    // États
    border: "rgba(255,255,255,0.08)", // Hairline blanche subtile
    danger: "#E57373", // Rouge plus doux pour le dark mode
    success: "#81C784", // Vert plus doux pour le dark mode

    // Navigation
    tabIconDefault: palette.coolGrey,
    tabIconSelected: palette.boneSilk,
  },
};

// --- 3. TYPOGRAPHIE ÉDITORIALE ---
export const Fonts = Platform.select({
  ios: {
    serif: "Georgia", // La police signature du thème
    sans: "System", // Pour les labels techniques (ex: 9px, gras, espacé)
    mono: "Courier",
  },
  android: {
    serif: "serif",
    sans: "sans-serif",
    mono: "monospace",
  },
  default: {
    serif: "serif",
    sans: "sans-serif",
    mono: "monospace",
  },
});
