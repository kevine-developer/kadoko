import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Notification } from "../../lib/services/notification-service";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";

interface NotificationItemProps {
  notification: Notification;
  onPress: (n: Notification) => void;
  onDelete: (id: string) => void;
}

const getTimeAgo = (dateData: string) => {
  const date = new Date(dateData);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "À l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onDelete,
}) => {
  const theme = useAppTheme();
  const router = useRouter();
  const isUnread = !notification.isRead;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(notification);
    if (notification.targetUrl) {
      router.push(notification.targetUrl as any);
    }
  };

  const handleDelete = (e: any) => {
    e.stopPropagation();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onDelete(notification.id);
  };

  const cleanMessage = notification.content.message
    ?.replace(notification.actor?.name || "", "")
    .trim();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { borderBottomColor: theme.border },
        isUnread && { backgroundColor: theme.surface }, // Simplifié pour éviter regex error
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Indicateur de lecture */}
      {isUnread && (
        <View style={[styles.unreadStrip, { backgroundColor: theme.accent }]} />
      )}

      <View style={styles.contentRow}>
        <Image
          source={{
            uri: notification.actor?.image || "https://i.pravatar.cc/150",
          }}
          style={[styles.avatar, { borderColor: theme.border }]}
          contentFit="cover"
        />

        <View style={styles.textContent}>
          <ThemedText style={styles.messageText} numberOfLines={2}>
            <ThemedText type="defaultBold">
              {notification.actor?.name}
            </ThemedText>{" "}
            {cleanMessage}
            {notification.content.giftTitle && (
              <ThemedText type="subtitle" style={styles.giftTitle}>
                {" "}
                « {notification.content.giftTitle} »
              </ThemedText>
            )}
          </ThemedText>
          <ThemedText
            type="caption"
            colorName="textSecondary"
            style={styles.timeText}
          >
            {getTimeAgo(notification.createdAt).toUpperCase()}
          </ThemedText>
        </View>

        <View style={styles.actionArea}>
          <TouchableOpacity
            onPress={handleDelete}
            style={styles.deleteCircle}
            activeOpacity={0.5}
          >
            <ThemedIcon
              name="close-outline"
              size={14}
              colorName="textSecondary"
            />
          </TouchableOpacity>
          <ThemedIcon name="chevron-forward" size={12} colorName="border" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
  },
  unreadStrip: {
    position: "absolute",
    left: 0,
    top: 20,
    bottom: 20,
    width: 3,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 0,
    backgroundColor: "#F2F2F7",
    borderWidth: 0.5,
  },
  textContent: {
    flex: 1,
    marginLeft: 15,
    marginRight: 10,
  },
  messageText: {
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  giftTitle: {
    fontStyle: "italic",
  },
  timeText: {
    marginTop: 6,
    letterSpacing: 1.2,
  },
  actionArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deleteCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.03)",
    alignItems: "center",
    justifyContent: "center",
  },
});
