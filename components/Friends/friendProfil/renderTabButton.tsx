import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'


interface RenderTabButtonProps {
    label: string;
    index: number;
    activePage: number;
    handleTabPress: (index: number) => void;
}

  const RenderTabButton = ({label, index, activePage, handleTabPress}: RenderTabButtonProps) => {
    const isActive = activePage === index;
    return (
      <TouchableOpacity
        onPress={() => handleTabPress(index)}
        style={[styles.tabBtn, isActive && styles.tabBtnActive]}
      >
        <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
          {label}
        </Text>
        {isActive && <View style={styles.activeDot} />}
      </TouchableOpacity>
    );
  };

export default RenderTabButton

const styles = StyleSheet.create({
     tabBtn: {
    paddingBottom: 8,
    position: "relative",
  },
  tabBtnActive: {
    // rien de spécial, géré par le dot
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  tabTextActive: {
    color: "#111827",
  },
  activeDot: {
    position: "absolute",
    bottom: 0,
    left: "30%",
    width: "40%",
    height: 3,
    backgroundColor: "#4F46E5",
    borderRadius: 2,
  },
})