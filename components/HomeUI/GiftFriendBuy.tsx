import { ScrollView, StyleSheet, View } from "react-native";
import React from "react";
import MysteryCard from "./mysteryCard";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";

const GiftFriendBuy = ({ gifts }: { gifts: any[] }) => {
  const theme = useAppTheme();
  if (gifts.length === 0) return null;

  return (
    <View>
      <View style={styles.header}>
        <View>
          <ThemedText type="hero" style={styles.sectionTitle}>
            En approche.
          </ThemedText>
          <ThemedText
            type="subtitle"
            colorName="textSecondary"
            style={styles.sectionSubtitle}
          >
            Quelque chose se prépare pour vous. Saurez-vous deviner quoi ?
          </ThemedText>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {gifts.map((gift, index) => (
          <MysteryCard key={gift.id} gift={gift} index={index} />
        ))}
      </ScrollView>
    </View>
  );
};

export default GiftFriendBuy;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  sectionTitle: {
    fontSize: 24,
    paddingHorizontal: 25,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    paddingHorizontal: 25,
    marginBottom: 15,
    lineHeight: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingRight: 40,
  },
});
