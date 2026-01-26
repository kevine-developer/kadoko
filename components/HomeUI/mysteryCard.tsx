import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import React from "react";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const THEME = {
  background: "#FDFBF7",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062", // Or
  mystery: "#1A1A1A", // Noir profond pour le mystère
  border: "rgba(0,0,0,0.08)",
  surface: "#FDFBF7",
};

const { width } = Dimensions.get("window");

const MysteryCard = ({
  gift,
  index = 0,
  handlePressMystery = () => {},
}: any) => {
  return (
    <TouchableOpacity
      key={gift.id}
      activeOpacity={0.9}
      onPress={handlePressMystery}
    >
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 100 }}
        style={styles.mysteryCard}
      >
        {/* Image du cadeau floutée */}
        {gift.imageUrl && (
          <Image
            source={{ uri: gift.imageUrl }}
            style={StyleSheet.absoluteFillObject}
            blurRadius={80}
          />
        )}

        {/* Effet de Mystère / Overlay */}
        <LinearGradient
          colors={["rgba(44, 44, 44, 0.85)", "rgba(0, 0, 0, 0.95)"]}
          style={styles.mysteryGradient}
        >
          <Ionicons
            name="gift"
            size={32}
            color={THEME.accent}
            style={{ opacity: 0.8 }}
          />
          <Text style={styles.mysteryLabel}>CONFIDENTIEL</Text>
        </LinearGradient>

        {/* Badge Indice */}
        <View style={styles.mysteryBadge}>
          <Text style={styles.mysteryBadgeText}>
            {gift.crowd > 1 ? `${gift.crowd} PARTICIPANTS` : "1 BIENFAITEUR"}
          </Text>
        </View>
      </MotiView>
    </TouchableOpacity>
  );
};

export default MysteryCard;

const styles = StyleSheet.create({
  /* MYSTERY CARDS */
  mysteryScroll: { paddingHorizontal: 25, gap: 15 },
  mysteryCard: {
    width: 150,
    height: 180,
    borderRadius: 0, 
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#000",
  },
  mysteryGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  mysteryLabel: {
    color: THEME.accent,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
  },
  mysteryBadge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 8,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
  },
  mysteryBadgeText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  emptyMystery: {
    width: width - 50,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: THEME.border,
    borderStyle: "dashed",
  },
  emptyText: { color: THEME.textSecondary, fontStyle: "italic" },
});
