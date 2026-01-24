import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";

// --- THEME ÉDITORIAL COHÉRENT ---
const THEME = {
  background: "#FDFBF7", // Bone Silk
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.08)",
};

interface EmptyFriendProps {
  onPress?: () => void;
}

const EmptyFriend = ({ onPress }: EmptyFriendProps) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "timing", duration: 800 }}
      style={styles.container}
    >
      {/* Icône Bijou */}
      <View style={styles.iconCircle}>
        <Ionicons name="people-outline" size={28} color={THEME.accent} />
      </View>

      {/* Texte Éditorial */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Cercle restreint.</Text>
        <Text style={styles.subtitle}>
          Votre répertoire est encore vide. Commencez à bâtir votre cercle pour
          partager vos intentions.
        </Text>
      </View>

      {/* Bouton Authority Rectangulaire */}
      <TouchableOpacity
        onPress={handlePress}
        style={styles.actionBtn}
        activeOpacity={0.9}
      >
        <Text style={styles.btnText}>INVITER VOS PROCHES</Text>
      </TouchableOpacity>

      {/* Ligne décorative minimaliste */}
      <View style={styles.decorativeLine} />
    </MotiView>
  );
};

export default EmptyFriend;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
    backgroundColor: "transparent",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(175, 144, 98, 0.2)", // Or brossé translucide
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 35,
  },
  title: {
    fontSize: 22,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: THEME.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    fontStyle: "italic",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  actionBtn: {
    backgroundColor: THEME.textMain,
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 0, // Rectangulaire luxe
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  decorativeLine: {
    width: 40,
    height: 1,
    backgroundColor: THEME.accent,
    marginTop: 40,
    opacity: 0.3,
  },
});
