import { Colors } from "@/constants/theme";
import { User } from "@/types/user";
import React from "react";
import { StyleSheet } from "react-native";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";

const UserInfoProfil = ({ user }: { user: User }) => {
  return (
    <ThemedView style={styles.userInfoSection}>
      <ThemedView style={styles.userMeta}>
        <ThemedText>{user?.fullName}</ThemedText>
        <ThemedText style={styles.userMetaSeparator}>|</ThemedText>
        <ThemedText>{user?.friends.length} amis</ThemedText>
      </ThemedView>
      <ThemedText>{user?.description}</ThemedText>
    </ThemedView>
  );
};

export default UserInfoProfil;

const styles = StyleSheet.create({
  userInfoSection: {
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "transparent",
  },
  userMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  userMetaSeparator: {
    fontSize: 18,
    color: Colors.light.textSecondary,
  },
});
