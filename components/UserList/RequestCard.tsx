import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

// --- THEME ÉDITORIAL COHÉRENT ---
const THEME = {
  background: "#FDFBF7", // Bone Silk
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.08)",
  success: "#4A6741",
};

interface RequestCardProps {
  user: any;
  loading?: boolean;
  handleAcceptFriend: () => void;
  handleRemoveFriend: () => void;
}

const RequestCard = ({
  user,
  loading,
  handleAcceptFriend,
  handleRemoveFriend,
}: RequestCardProps) => {
  const onAccept = () => {
    if (loading) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    handleAcceptFriend();
  };

  const onIgnore = () => {
    if (loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleRemoveFriend();
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.header}>
        {/* Avatar Carré style Galerie */}
        <Image
          source={{
            uri: user.avatarUrl || user.image || "https://i.pravatar.cc/150",
          }}
          style={styles.avatar}
          contentFit="cover"
        />
        <View style={styles.info}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.metaLabel}>INVITATION AU CERCLE</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.acceptBtn, loading && { opacity: 0.7 }]}
          onPress={onAccept}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.acceptText}>ACCEPTER</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ignoreBtn}
          onPress={onIgnore}
          activeOpacity={0.6}
          disabled={loading}
        >
          <Ionicons
            name="close-outline"
            size={20}
            color={THEME.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RequestCard;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: THEME.surface,
    padding: 20,
    borderRadius: 0, // Carré luxe
    marginRight: 16,
    width: 240,
    borderWidth: 1,
    borderColor: THEME.border,
    // Ombre ultra-légère pour détacher du fond Bone Silk
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 0, // Style boutique
    backgroundColor: "#F2F2F7",
    borderWidth: 0.5,
    borderColor: THEME.border,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontWeight: "500",
    color: THEME.textMain,
    marginBottom: 2,
  },
  metaLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: THEME.accent,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: THEME.textMain,
    height: 40,
    borderRadius: 0, // Bouton rectangulaire luxe
    alignItems: "center",
    justifyContent: "center",
  },
  acceptText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  ignoreBtn: {
    width: 40,
    height: 40,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
});
