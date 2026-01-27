import { StyleSheet, View } from "react-native";
import React from "react";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";
import { ThemedText } from "../themed-text";

const EmptyFeed = () => {
  const theme = useAppTheme();
  return (
    <View style={styles.emptyFeed}>
      <View style={[styles.iconCircle, { borderColor: `${theme.accent}33` }]}>
        <ThemedIcon name="gift-outline" size={28} colorName="accent" />
      </View>
      <ThemedText
        type="title"
        colorName="textSecondary"
        style={styles.emptyFeedTitle}
      >
        La page est blanche.
      </ThemedText>
      <ThemedText
        type="default"
        colorName="textSecondary"
        style={styles.emptyFeedText}
      >
        Vos amis n&apos;ont pas encore partagé leurs envies. Soyez le premier à
        inaugurer le registre.
      </ThemedText>
    </View>
  );
};

export default EmptyFeed;

const styles = StyleSheet.create({
  emptyFeed: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyFeedTitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  emptyFeedText: {
    textAlign: "center",
  },
});
