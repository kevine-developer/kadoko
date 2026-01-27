import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import ThemedIcon from "@/components/themed-icon";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";

const Header = () => {
  const theme = useAppTheme();

  return (
    <View style={styles.headerTop}>
      <View>
        <ThemedText
          type="label"
          colorName="textSecondary"
          style={styles.headerSubtitle}
        >
          COMMUNAUTÉ
        </ThemedText>
        <ThemedText type="title" style={styles.headerTitle}>
          Mon Cercle
        </ThemedText>
      </View>
      <TouchableOpacity
        style={[
          styles.inviteBtn,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <ThemedIcon name="share-outline" size={22} colorName="textMain" />
      </TouchableOpacity>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 11,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 34,
    letterSpacing: -0.5,
  },
  inviteBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
});
