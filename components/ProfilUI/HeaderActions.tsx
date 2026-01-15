import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { ThemedView } from "../themed-view";
import ActionButton from "./ActionButton";

interface HeaderActionsProps {
  style?: StyleProp<ViewStyle>;
}

const HeaderActions = ({ style }: HeaderActionsProps) => {
  return (
    <View style={[styles.headerActions, style]}>
      <ThemedView style={styles.actionsGroup}></ThemedView>
      <ThemedView style={styles.actionsGroup}>
        <ActionButton icon="pencil-outline" />
        <ActionButton icon="share-outline" />
      </ThemedView>
    </View>
  );
};

export default HeaderActions;

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  actionsGroup: {
    flexDirection: "row",
    gap: 10,
  },
});
