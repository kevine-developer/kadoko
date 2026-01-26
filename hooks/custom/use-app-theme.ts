// hooks/use-app-theme.ts
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/theme";

export function useAppTheme() {
  const theme = useColorScheme() ?? "light";
  return Colors[theme];
}