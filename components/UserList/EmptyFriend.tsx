import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";

interface EmptyFriendProps {
  onPress?: () => void;
}

const EmptyFriend = ({ onPress }: EmptyFriendProps) => {
  const theme = useAppTheme();
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "timing", duration: 800 }}
      style={styles.container}
    >
      <View
        style={[
          styles.iconCircle,
          { borderColor: `rgba(${theme.accent.replace(/[^0-9,]/g, "")}, 0.2)` },
        ]}
      >
        <ThemedIcon name="people-outline" size={28} colorName="accent" />
      </View>

      <View style={styles.textContainer}>
        <ThemedText type="hero" style={styles.title}>
          Cercle restreint.
        </ThemedText>
        <ThemedText
          type="subtitle"
          colorName="textSecondary"
          style={styles.subtitle}
        >
          Votre répertoire est encore vide. Commencez à bâtir votre cercle pour
          partager vos intentions.
        </ThemedText>
      </View>

      <TouchableOpacity
        onPress={handlePress}
        style={[styles.actionBtn, { backgroundColor: theme.textMain }]}
        activeOpacity={0.9}
      >
        <ThemedText
          type="label"
          style={[styles.btnText, { color: theme.background }]}
        >
          INVITER VOS PROCHES
        </ThemedText>
      </TouchableOpacity>

      <View
        style={[styles.decorativeLine, { backgroundColor: theme.accent }]}
      />
    </MotiView>
  );
};

export default EmptyFriend;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
    backgroundColor: "transparent",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 35,
  },
  title: {
    marginBottom: 12,
  },
  subtitle: {
    textAlign: "center",
  },
  actionBtn: {
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 0,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    letterSpacing: 1.5,
  },
  decorativeLine: {
    width: 40,
    height: 1,
    marginTop: 40,
    opacity: 0.3,
  },
});
