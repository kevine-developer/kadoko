import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { router } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

const ProfilCard = ({user}: any) => {
  return (
      <View style={styles.cardHeader}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{
              uri:
                user?.image ||
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400",
            }}
            style={styles.avatar}
          />
          <View style={styles.editAvatarBadge}>
            <Ionicons name="pencil" size={10} color="#FFF" />
          </View>
        </View>

        <View style={styles.identityContainer}>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userHandle}>@{user?.email?.split("@")[0]}</Text>
        </View>

        <TouchableOpacity
          style={styles.editProfileBtn}
          onPress={() => router.push("/(screens)/settingsScreen")}
        >
          <Text style={styles.editProfileText}>Éditer</Text>
        </TouchableOpacity>
      </View>

  );
};

export default ProfilCard;

const styles = StyleSheet.create({
  /* --- PROFILE CARD --- */
  profileCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 32,
    padding: 24,
    marginBottom: 32,
    // Ombre diffuse
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center", // Alignement centré verticalement
    marginBottom: 24,
  },
  avatarWrapper: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    backgroundColor: "#F3F4F6",
  },
  editAvatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#111827",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  identityContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: "500",
    color: "#111827",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginBottom: 2,
  },
  userHandle: {
    fontSize: 14,
    color: "#9CA3AF",
    letterSpacing: 0.5,
  },
  editProfileBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  editProfileText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
});
