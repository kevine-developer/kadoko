import {
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";

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
  const theme = useAppTheme();

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

  const renderActionLabel = () => {
    if (isFriend) return "RETIRER";
    if (isPendingAdd) return "EN ATTENTE";
    return "AJOUTER";
  };

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      style={[styles.container, { borderBottomColor: theme.border }]}
      onPress={() =>
        router.push({
          pathname: "/profilFriend/[friendId]",
          params: { friendId: user.id },
        })
      }
    >
      <View style={styles.userInfo}>
        <Image
          source={{
            uri: user.avatarUrl || user.image || "https://i.pravatar.cc/150",
          }}
          style={[styles.avatar, { borderColor: theme.border }]}
          contentFit="cover"
        />
        <View style={styles.textContainer}>
          <ThemedText type="subtitle" style={styles.name}>
            {user.name}
          </ThemedText>
          <ThemedText
            type="label"
            colorName="textSecondary"
            style={styles.status}
          >
            {isFriend
              ? "CERCLE PROCHE"
              : isPendingAdd
                ? "DEMANDE ENVOYÉE"
                : "MEMBRE GIFTFLOW"}
          </ThemedText>
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
          { borderColor: theme.textMain, backgroundColor: theme.textMain },
          isFriend && {
            borderColor: "rgba(195, 74, 74, 0.2)",
            backgroundColor: "transparent",
          },
          isPendingAdd && {
            borderColor: theme.border,
            backgroundColor: "transparent",
          },
          loading && { opacity: 0.7 },
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={isFriend || isPendingAdd ? theme.textMain : theme.background}
          />
        ) : (
          <ThemedText
            type="label"
            style={[
              styles.actionText,
              { color: theme.background },
              isFriend && { color: theme.danger },
              isPendingAdd && { color: theme.textSecondary },
            ]}
          >
            {renderActionLabel()}
          </ThemedText>
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
    borderRadius: 0,
    backgroundColor: "#F2F2F7",
    borderWidth: 1,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    letterSpacing: -0.3,
  },
  status: {
    letterSpacing: 1,
    marginTop: 3,
    textTransform: "uppercase",
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 0,
  },
  actionText: {
    letterSpacing: 1.2,
    textAlign: "center",
  },
});
