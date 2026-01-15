import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

const ActionButton = ({ icon }: { icon: keyof typeof Ionicons.glyphMap }) => (
  <TouchableOpacity style={[styles.actionBtn]}>
    <Ionicons name={icon} size={20} color={"#3a3a3ad7"} />
  </TouchableOpacity>
);

export default ActionButton;

const styles = StyleSheet.create({
  actionBtn: {
    width: 60,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffffff",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
