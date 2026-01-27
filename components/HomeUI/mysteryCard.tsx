import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import React from "react";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/themed-text";
import ThemedIcon from "@/components/themed-icon";
import { useAppTheme } from "@/hooks/custom/use-app-theme";

const { width } = Dimensions.get("window");

const MysteryCard = ({
  gift,
  index = 0,
  handlePressMystery = () => {},
}: any) => {
  const theme = useAppTheme();

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
        {gift.imageUrl && (
          <Image
            source={{ uri: gift.imageUrl }}
            style={StyleSheet.absoluteFillObject}
            blurRadius={80}
          />
        )}

        <LinearGradient
          colors={["rgba(44, 44, 44, 0.85)", "rgba(0, 0, 0, 0.95)"]}
          style={styles.mysteryGradient}
        >
          <ThemedIcon
            name="gift"
            size={32}
            colorName="accent"
            // style={{ opacity: 0.8 }} // Props style non supporté par ThemedIcon
          />
          <ThemedText
            type="label"
            colorName="accent"
            style={styles.mysteryLabel}
          >
            CONFIDENTIEL
          </ThemedText>
        </LinearGradient>

        <View style={styles.mysteryBadge}>
          <ThemedText type="label" style={styles.mysteryBadgeText}>
            {gift.crowd > 1 ? `${gift.crowd} PARTICIPANTS` : "1 BIENFAITEUR"}
          </ThemedText>
        </View>
      </MotiView>
    </TouchableOpacity>
  );
};

export default MysteryCard;

const styles = StyleSheet.create({
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
    letterSpacing: 0.5,
  },
});
