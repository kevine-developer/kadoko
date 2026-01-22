import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// --- THEME LUXE ---
const THEME = {
  background: "#FDFBF7",
  surface: "#FFFFFF",
  textMain: "#111827",
  textSecondary: "#6B7280",
  accent: "#111827",
  border: "rgba(0,0,0,0.06)",
  success: "#10B981",
  danger: "#EF4444",
  disabledBg: "#F3F4F6",
  disabledText: "#9CA3AF",
};

interface UserRowCardProps {
  user: any;
  isFriend?: boolean;
  isPendingAdd?: boolean; // ✅ Nouvel état : Demande en attente
  handleAddFriend: () => void;
  handleCancelRequest?: () => void;
  handleRemoveFriend?: () => void;
}

const UserRowCard = ({
  user,
  isFriend,
  isPendingAdd,
  handleAddFriend,
  handleCancelRequest,
  handleRemoveFriend,
}: UserRowCardProps) => {
  // Logique d'affichage dynamique du bouton
  const renderButtonContent = () => {
    if (isFriend) {
      return (
        <>
          <Text style={styles.btnTextDelete}>Retirer</Text>
          <Ionicons name="trash-outline" size={14} color={THEME.danger} />
        </>
      );
    }
    if (isPendingAdd) {
      return (
        <>
          <Text style={styles.btnTextPending}>Envoyé</Text>
          <Ionicons name="checkmark" size={14} color={THEME.disabledText} />
        </>
      );
    }
    return (
      <>
        <Text style={styles.btnTextSolid}>Ajouter</Text>
        <Ionicons name="add" size={14} color="#FFF" />
      </>
    );
  };

  // Styles dynamiques du bouton
  const getButtonStyle = () => {
    if (isFriend) return styles.btnOutlineDelete;
    if (isPendingAdd) return styles.btnPending;
    return styles.btnSolid;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.userRowContainer}
      onPress={() =>
        router.push({
          pathname: "/profilFriend/[friendId]",
          params: { friendId: user.id },
        })
      }
    >
      {/* INFO GAUCHE */}
      <View style={styles.userRowLeft}>
        <Image
          source={{ uri: user.avatarUrl || user.image }}
          style={styles.rowAvatar}
          contentFit="cover"
        />
        <View style={styles.rowText}>
          <Text style={styles.rowName}>{user.name}</Text>
          <Text style={styles.rowHandle}>
            {isFriend
              ? "Dans votre cercle"
              : isPendingAdd
                ? "Demande envoyée"
                : "Utilisateur"}
          </Text>
        </View>
      </View>

      {/* BOUTON D'ACTION */}
      <TouchableOpacity
        style={[styles.rowActionBtn, getButtonStyle()]}
        onPress={(e) => {
          e.stopPropagation(); // Empêche d'ouvrir le profil au clic sur le bouton
          if (isFriend) {
            handleRemoveFriend?.();
          } else if (isPendingAdd) {
            handleCancelRequest?.();
          } else {
            handleAddFriend();
          }
        }}
      >
        {renderButtonContent()}
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default UserRowCard;

const styles = StyleSheet.create({
  /* USER ROWS (Vertical) */
  userRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14, // Un peu plus d'air
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.03)",
  },
  userRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1, // Prend la place disponible pour ne pas écraser le bouton
  },
  rowAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#FFFFFF", // Petit contour blanc propre
  },
  rowText: {
    justifyContent: "center",
    flex: 1,
  },
  rowName: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.textMain,
    marginBottom: 2,
  },
  rowHandle: {
    fontSize: 13,
    color: THEME.textSecondary,
  },

  /* BOUTONS ACTIONS */
  rowActionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minWidth: 90, // Assure une largeur constante pour éviter les sauts
    height: 36,
  },

  // Style 1: Ajouter (Solid Noir)
  btnSolid: {
    backgroundColor: THEME.textMain,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  btnTextSolid: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },

  // Style 2: Voir (Outline)
  btnOutline: {
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: "transparent",
  },
  btnTextOutline: {
    color: THEME.textMain,
    fontSize: 12,
    fontWeight: "600",
  },

  // Style 3: En attente (Disabled Gray)
  btnPending: {
    backgroundColor: THEME.disabledBg, // Gris clair
    borderWidth: 0,
  },
  btnTextPending: {
    color: THEME.disabledText, // Gris foncé
    fontSize: 12,
    fontWeight: "600",
  },
  // Style 4: Delete (Red Outline)
  btnOutlineDelete: {
    borderWidth: 1,
    borderColor: THEME.danger,
    backgroundColor: "transparent",
  },
  btnTextDelete: {
    color: THEME.danger,
    fontSize: 12,
    fontWeight: "600",
  },
});
