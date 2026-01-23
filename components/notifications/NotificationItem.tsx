import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Notification } from "../../lib/services/notification-service";
import { useRouter } from "expo-router";

interface NotificationItemProps {
  notification: Notification;
  onPress: (n: Notification) => void;
}

const getTimeAgo = (dateData: string) => {
  const date = new Date(dateData);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1)
    return Math.floor(interval) + " an" + (Math.floor(interval) > 1 ? "s" : "");
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " mois";
  interval = seconds / 86400;
  if (interval > 1)
    return (
      Math.floor(interval) + " jour" + (Math.floor(interval) > 1 ? "s" : "")
    );
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " h";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " min";
  return "À l'instant";
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
}) => {
  const router = useRouter();

  const handlePress = () => {
    onPress(notification);
    if (notification.targetUrl) {
      router.push(notification.targetUrl as any);
    }
  };

  const timeAgo = getTimeAgo(notification.createdAt);

  return (
    <TouchableOpacity
      style={[styles.container, !notification.isRead && styles.unreadContainer]}
      onPress={handlePress}
    >
      <View style={styles.avatarContainer}>
        {notification.actor?.image ? (
          <Image
            source={{ uri: notification.actor.image }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, styles.placeholderAvatar]}>
            <Text style={styles.placeholderText}>
              {notification.actor?.name?.charAt(0).toUpperCase() || "?"}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.message} numberOfLines={2}>
          <Text style={styles.actorName}>{notification.actor?.name} </Text>
          {notification.content.message?.replace(
            notification.actor?.name || "",
            "",
          )}
          {notification.content.giftTitle &&
            ` "${notification.content.giftTitle}"`}
        </Text>
        <Text style={styles.time}>{timeAgo}</Text>
      </View>

      {!notification.isRead && <View style={styles.dot} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "white",
    alignItems: "center",
  },
  unreadContainer: {
    backgroundColor: "#f9fcfd",
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  placeholderAvatar: {
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#555",
  },
  contentContainer: {
    flex: 1,
  },
  actorName: {
    fontWeight: "bold",
  },
  message: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#007AFF",
    marginLeft: 8,
  },
});
