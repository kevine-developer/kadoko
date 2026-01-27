import { useColorScheme as useNativeColorScheme } from "react-native";
import { useUIStore } from "@/lib/ui-store";

export function useColorScheme() {
  const { themePreference } = useUIStore();
  const systemTheme = useNativeColorScheme() ?? "light";

  if (themePreference === "system") {
    return systemTheme;
  }

  return themePreference;
}
