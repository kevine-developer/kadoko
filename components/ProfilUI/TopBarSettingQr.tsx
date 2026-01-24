import { StyleSheet, TouchableOpacity, View, Platform } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

// --- THEME ÉDITORIAL COHÉRENT ---
const THEME = {
  textMain: "#1A1A1A",
  surface: "#FFFFFF",
  border: "rgba(0,0,0,0.08)",
  background: "#FDFBF7",
  premiumCard: "#AF9062",
};

interface TopBarSettingQrProps {
  handleSettingsPress: () => void;
  onQrPress?: () => void;
  showPremiumCard?: () => void;
}

const TopBarSettingQr = ({
  handleSettingsPress,
  onQrPress,
  showPremiumCard,
}: TopBarSettingQrProps) => {
  
  const handlePress = (callback?: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    callback?.();
  };

  return (
    <View style={styles.navActions}>
        {/* Premium card */}
      <TouchableOpacity
        style={styles.iconButtonRegistry}
        onPress={() => handlePress(showPremiumCard)}
        activeOpacity={0.7}
      >
        <Ionicons name="card-outline" size={20} color={THEME.premiumCard} />
      </TouchableOpacity>
      {/* Bouton QR Code */}
      <TouchableOpacity 
        style={styles.iconButtonRegistry} 
        onPress={() => handlePress(onQrPress)}
        activeOpacity={0.7}
      >
        <Ionicons name="qr-code-outline" size={20} color={THEME.textMain} />
      </TouchableOpacity>

      {/* Bouton Paramètres */}
      <TouchableOpacity
        style={styles.iconButtonRegistry}
        onPress={() => handlePress(handleSettingsPress)}
        activeOpacity={0.7}
      >
        <Ionicons name="settings-outline" size={20} color={THEME.textMain} />
      </TouchableOpacity>
    
    </View>
  );
};

export default TopBarSettingQr;

const styles = StyleSheet.create({
  navActions: {
    flexDirection: "row",
    gap: 10, // Espacement légèrement réduit pour plus de finesse
  },
  iconButtonRegistry: {
    width: 42,
    height: 42,
    borderRadius: 0, // Optionnel : passer à 0 pour un look "carré luxe" ou garder 21 pour du rond
    backgroundColor: THEME.surface,
    alignItems: "center",
    justifyContent: "center",
    // Bordure Hairline (très fine)
    borderWidth: 1,
    borderColor: THEME.border,
    // Ombre très subtile (pas de gros flou)
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
});