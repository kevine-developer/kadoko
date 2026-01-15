import { MotiView } from "moti";
import React from "react";
import { Pressable, StyleSheet } from "react-native";

interface InteractiveCardProps {
  children: React.ReactNode;
  onPress: () => void;
}

export const InteractiveCard = ({
  children,
  onPress,
}: InteractiveCardProps) => {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <MotiView
          animate={{
            scale: pressed ? 0.96 : 1,
            backgroundColor: pressed ? "#F8FAFC" : "#FFFFFF",
          }}
          transition={{ type: "spring", damping: 15 }}
          style={styles.card}
        >
          {children}
        </MotiView>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    // Ombre très douce et diffuse
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
});
