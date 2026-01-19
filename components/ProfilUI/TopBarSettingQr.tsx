import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

interface TopBarSettingQrProps {
  handleSettingsPress: () => void;
}

const TopBarSettingQr = ({ handleSettingsPress }: TopBarSettingQrProps) => {
  return (
    <View style={styles.navActions}>
      <TouchableOpacity style={styles.iconButtonBlur}>
        <Ionicons name="qr-code-outline" size={20} color="#FFF" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.iconButtonBlur}
        onPress={handleSettingsPress}
      >
        <Ionicons name="settings-outline" size={20} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

export default TopBarSettingQr;

const styles = StyleSheet.create({
  navActions: {
    flexDirection: "row",
    gap: 12,
  },
  iconButtonBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(12px)",
  },
});
