import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

const THEME = {
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062",
  border: "rgba(0,0,0,0.06)",
};

const ProfilCard = ({ user, onEditAvatar }: any) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={onEditAvatar}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: user?.image || "https://i.pravatar.cc/150" }}
          style={styles.avatar}
        />
        <View style={styles.editBadge}>
          <Ionicons name="camera" size={12} color="#FFF" />
        </View>
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.handle}>
          {user?.username ? `@${user.username}` : "Alias non défini"}
        </Text>
        {user?.description && (
          <Text style={styles.bio}>{user.description}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", marginBottom: 30 },
  avatarContainer: { position: "relative" },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 0,
    backgroundColor: "#F2F2F7",
    borderWidth: 1,
    borderColor: THEME.border,
  },
  editBadge: {
    position: "absolute",
    bottom: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: THEME.textMain,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FDFBF7",
  },
  info: { flex: 1, marginLeft: 25 },
  name: {
    fontSize: 28,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    letterSpacing: -1,
  },
  handle: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.accent,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  bio: {
    fontSize: 13,
    color: THEME.textSecondary,
    marginTop: 8,
    lineHeight: 18,
    fontStyle: "italic",
  },
});

export default ProfilCard;
