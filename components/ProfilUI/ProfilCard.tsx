import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { Image } from "expo-image";
import Icon from "../themed-icon";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";

const ProfilCard = ({ user, onEditAvatar }: any) => {

  const theme = useAppTheme();
  return (
    <View style={styles.container}>
      <View style={styles.avatarAndInfoContainer}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={onEditAvatar}
          activeOpacity={0.9}
        >
          <Image
            source={{
              uri:
                user?.image ||
                "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=400&fit=crop&q=60",
            }}
            style={[styles.avatar, { borderColor: theme.border }]}
          />
          <View
            style={[
              styles.editBadge,
              { backgroundColor: theme.primary, borderColor: theme.background },
            ]}
          >
            <Icon name="camera" size={12} color="#FFF" />
          </View>
        </TouchableOpacity>
        <View style={styles.info}>
          <ThemedText type="defaultBold" style={styles.name}>
            {user?.name}
          </ThemedText>

          <ThemedText type="label" style={{ color: theme.accent, marginTop: 2 }}>
            {user?.username ? `@${user.username}` : "Alias non défini"}
          </ThemedText>
        </View>
      </View>

      {user?.description && (
        <ThemedText
          type="subtitle"
          style={[styles.bio, { color: theme.textSecondary }]}
        >
          {user.description}
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 5,
  },
  avatarAndInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 0,
    backgroundColor: "#F2F2F7",
    borderWidth: 1,
  },
  editBadge: {
    position: "absolute",
    bottom: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  info: {
    flex: 1,
    marginLeft: 20,
  },
  name: {
    letterSpacing: -1,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ProfilCard;
