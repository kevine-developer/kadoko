// components/themed-icon.tsx
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Colors } from "@/constants/theme";

interface ThemedIconProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  colorName?: keyof typeof Colors.light;
}

const ThemedIcon = ({
  name,
  size = 20,
  color,
  colorName = "accent",
}: ThemedIconProps) => {
  const themeColor = useThemeColor({}, colorName);

  return <Ionicons name={name} size={size} color={color ?? themeColor} />;
};

export default ThemedIcon;
