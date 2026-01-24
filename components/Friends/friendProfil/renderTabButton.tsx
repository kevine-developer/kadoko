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
      </TouchableOpacity>
    );
};

export default RenderTabButton

const styles = StyleSheet.create({
  tabBtn: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#1A1A1A",
  },
  tabText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#8E8E93",
    letterSpacing: 1.5,
  },
  tabTextActive: {
    color: "#1A1A1A",
  },
});