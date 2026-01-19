import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
const THEME = {
  background: "#FDFBF7", // Blanc cassé "Bone"
  surface: "#FFFFFF",
  textMain: "#111827", // Noir profond
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  primary: "#111827",
  inputBg: "#FFFFFF",
};

interface BtnSocialProps {
  handleSocialLogin: () => void;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}
const BtnSocial = ({ handleSocialLogin, icon, label }: BtnSocialProps) => {
  return (
    <TouchableOpacity
      style={styles.socialBtn}
      onPress={handleSocialLogin}
    >
      <Ionicons name={icon} size={22} color={THEME.textMain} />
      <Text style={styles.socialText}>{label}</Text>
    </TouchableOpacity>
  );
};

export default BtnSocial;

const styles = StyleSheet.create({  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 16,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  socialText: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.textMain,
  },});
