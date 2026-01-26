import { StyleSheet, TouchableOpacity, View, Platform } from "react-native";
import React from "react";
import * as Haptics from "expo-haptics";
import Icon from "../themed-icon";
import { Ionicons } from "@expo/vector-icons";


interface TopBarSettingQrProps {
  handleSettingsPress: () => void;
  onQrPress?: () => void;
  showPremiumCard?: () => void;
}
interface ItemTopBarProps {
  onPress: () => void;
  name: keyof typeof Ionicons.glyphMap;
  color?: string;
}

const ItemTopBar = ({ onPress, name, color }: ItemTopBarProps) => {
  return (
    <TouchableOpacity
      style={styles.iconButtonRegistry}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Icon name={name} color={color} />
    </TouchableOpacity>
  );
};

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
      <ItemTopBar
        onPress={() => handlePress(showPremiumCard)}
        name="card-outline"
      />
      {/* Bouton QR Code */}
      <ItemTopBar
        onPress={() => handlePress(onQrPress)}
        name="qr-code-outline"
        color="#1A1A1A"
      />
      {/* Bouton Paramètres */}
      <ItemTopBar
        onPress={() => handlePress(handleSettingsPress)}
        name="settings-outline"
        color="#1A1A1A"
      />
    </View>
  );
};

export default TopBarSettingQr;

const styles = StyleSheet.create({
  navActions: {
    flexDirection: "row",
    gap: 10,
  },
  iconButtonRegistry: {
    width: 42,
    height: 42,
    borderRadius: 0,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
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
