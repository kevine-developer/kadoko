import React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";

const HeaderHome = ({ user }: any) => {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.headerContainer,
        { paddingTop: insets.top + 10, backgroundColor: theme.background },
      ]}
    >
      <View>
        <ThemedText
          type="label"
          colorName="textSecondary"
          style={styles.headerDate}
        >
          {new Date()
            .toLocaleDateString("fr-FR", { weekday: "long", day: "numeric" })
            .toUpperCase()}
        </ThemedText>
        <ThemedText type="hero" style={styles.headerTitle}>
          Gift
          <ThemedText type="hero" style={styles.headerTitleItalic}>
            Flow
          </ThemedText>
        </ThemedText>
      </View>
    </View>
  );
};

export default HeaderHome;

const styles = StyleSheet.create({
  /* HEADER STYLE */
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerDate: {
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  headerTitle: {
    letterSpacing: -0.5,
  },
  headerTitleItalic: {
    fontStyle: "italic",
    fontWeight: "500",
  },
  headerAvatarBtn: {
    position: "relative",
  },
  notificationCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  notificationBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: "#FFF",
  },
});
