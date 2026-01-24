import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React from "react";
import MysteryCard from "./mysteryCard";

// --- THEME ÉDITORIAL ---
const THEME = {
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062", // Or brossé
};

const GiftFriendBuy = ({ gifts }: { gifts: any[] }) => {
  if (gifts.length === 0) return null;

  return (
    <View >
      {/* HEADER SECTION STYLE JOURNAL */}
      <View style={styles.header}>
        <View>
          <Text style={styles.sectionTitle}>En approche.</Text>
          <Text style={styles.sectionSubtitle}>
            Quelque chose se prépare pour vous. Saurez-vous deviner quoi ?
          </Text>
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
  /* SECTIONS */
  section: { paddingVertical: 20 },
  sectionTitle: {
    fontSize: 24,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    paddingHorizontal: 25,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: THEME.textSecondary,
    paddingHorizontal: 25,
    marginBottom: 15,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.accent,
    opacity: 0.2,
    marginHorizontal: 25,
    marginVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingRight: 40, // Espace extra à la fin
  },
});
