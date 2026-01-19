import { StyleSheet, Text, View } from "react-native";
import React from "react";


interface DividerConnectProps {
  text: string;
}

const DividerConnect = ({ text }: DividerConnectProps) => {
  return (
    <View style={styles.dividerContainer}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>{text}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
};

export default DividerConnect;

const styles = StyleSheet.create({  /* --- DIVIDER --- */
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1,
  },
});
