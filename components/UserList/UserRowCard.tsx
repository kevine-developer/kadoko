import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as Haptics from "expo-haptics";

// --- THEME ÉDITORIAL COHÉRENT ---
const THEME = {
  background: "#FDFBF7",
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.08)",
  danger: "#C34A4A",
  success: "#4A6741", // Vert forêt luxe
};

interface UserRowCardProps {
  user: any;
  isFriend?: boolean;
  isPendingAdd?: boolean;
  loading?: boolean;
  handleAddFriend: () => void;
  handleCancelRequest?: () => void;
  handleRemoveFriend?: () => void;
}

const UserRowCard = ({
  user,
  isFriend,
  isPendingAdd,
  loading,
  handleAddFriend,
  handleCancelRequest,
  handleRemoveFriend,
}: UserRowCardProps) => {
  const handleAction = () => {
    if (loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isFriend) {
      handleRemoveFriend?.();
    } else if (isPendingAdd) {
      handleCancelRequest?.();
    } else {
      handleAddFriend();
    }
  };

  // Rendu textuel de l'action pour le look "Boutique"
  const renderActionLabel = () => {
    if (isFriend) return "RETIRER";
    if (isPendingAdd) return "EN ATTENTE";
    return "AJOUTER";
  };

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      style={styles.container}
      onPress={() =>
        router.push({
          pathname: "/profilFriend/[friendId]",
          params: { friendId: user.id },
        })
      }
    >
      {/* SECTION IDENTITÉ */}
      <View style={styles.userInfo}>
        <Image
          source={{
            uri: user.avatarUrl || user.image || "https://i.pravatar.cc/150",
          }}
          style={styles.avatar}
          contentFit="cover"
        />
        <View style={styles.textContainer}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.status}>
            {isFriend
              ? "CERCLE PROCHE"
              : isPendingAdd
                ? "DEMANDE ENVOYÉE"
                : "MEMBRE GIFTFLOW"}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          handleAction();
        }}
        disabled={loading}
        style={[
          styles.actionBtn,
          isFriend && styles.actionBtnDelete,
          isPendingAdd && styles.actionBtnPending,
          loading && { opacity: 0.7 },
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={isFriend || isPendingAdd ? THEME.textMain : "#FFF"}
          />
        ) : (
          <Text
            style={[
              styles.actionText,
              isFriend && styles.actionTextDelete,
              isPendingAdd && styles.actionTextPending,
            ]}
          >
            {renderActionLabel()}
          </Text>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default UserRowCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    borderBottomWidth: 0.5,
    borderBottomColor: THEME.border,
    backgroundColor: "transparent",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 0, // Carré pour le look luxe / boutique
    backgroundColor: "#F2F2F7",
    borderWidth: 1,
    borderColor: THEME.border,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    letterSpacing: -0.3,
  },
  status: {
    fontSize: 9,
    fontWeight: "800",
    color: THEME.textSecondary,
    letterSpacing: 1,
    marginTop: 3,
    textTransform: "uppercase",
  },

  /* BOUTON D'ACTION STYLE ÉDITORIAL */
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: THEME.textMain,
    backgroundColor: THEME.textMain,
    borderRadius: 0, // Rectangulaire
  },
  actionBtnPending: {
    backgroundColor: "transparent",
    borderColor: THEME.border,
  },
  actionBtnDelete: {
    backgroundColor: "transparent",
    borderColor: "rgba(195, 74, 74, 0.2)", // Rouge discret
  },
  actionText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 1.2,
    textAlign: "center",
  },
  actionTextPending: {
    color: THEME.textSecondary,
  },
  actionTextDelete: {
    color: THEME.danger,
  },
});
