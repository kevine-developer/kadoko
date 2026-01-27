import {
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";

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
  const theme = useAppTheme();

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
    <View
      style={[
        styles.cardContainer,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <View style={styles.header}>
        <Image
          source={{
            uri: user.avatarUrl || user.image || "https://i.pravatar.cc/150",
          }}
          style={[styles.avatar, { borderColor: theme.border }]}
          contentFit="cover"
        />
        <View style={styles.info}>
          <ThemedText type="subtitle" style={styles.name}>
            {user.name}
          </ThemedText>
          <ThemedText type="label" colorName="accent" style={styles.metaLabel}>
            INVITATION AU CERCLE
          </ThemedText>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[
            styles.acceptBtn,
            { backgroundColor: theme.textMain },
            loading && { opacity: 0.7 },
          ]}
          onPress={onAccept}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.background} />
          ) : (
            <ThemedText type="label" style={styles.acceptText}>
              ACCEPTER
            </ThemedText>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.ignoreBtn, { borderColor: theme.border }]}
          onPress={onIgnore}
          activeOpacity={0.6}
          disabled={loading}
        >
          <ThemedIcon
            name="close-outline"
            size={20}
            colorName="textSecondary"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RequestCard;

const styles = StyleSheet.create({
  cardContainer: {
    padding: 20,
    borderRadius: 0,
    marginRight: 16,
    width: 240,
    borderWidth: 1,
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
    borderRadius: 0,
    backgroundColor: "#F2F2F7",
    borderWidth: 0.5,
  },
  info: {
    flex: 1,
  },
  name: {
    marginBottom: 2,
  },
  metaLabel: {
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  acceptBtn: {
    flex: 1,
    height: 40,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptText: {
    color: "#FFF",
    letterSpacing: 1.2,
  },
  ignoreBtn: {
    width: 40,
    height: 40,
    borderRadius: 0,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
});
