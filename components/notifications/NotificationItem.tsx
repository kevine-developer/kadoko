import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Notification } from "../../lib/services/notification-service";
import { Ionicons } from "@expo/vector-icons";

// --- THEME ÉDITORIAL COHÉRENT ---
const THEME = {
  background: "#FDFBF7",
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.06)",
  unreadBg: "rgba(175, 144, 98, 0.03)", // Teinte or très légère
  danger: "#C34A4A", // Rouge brique luxe
};

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
      style={[styles.container, isUnread && styles.unreadContainer]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Indicateur de lecture "Or brossé" - Sceau de confidentialité */}
      {isUnread && <View style={styles.unreadStrip} />}

      <View style={styles.contentRow}>
        {/* Avatar format Galerie (Carré) */}
        <Image
          source={{
            uri: notification.actor?.image || "https://i.pravatar.cc/150",
          }}
          style={styles.avatar}
          contentFit="cover"
        />

        <View style={styles.textContent}>
          <Text style={styles.messageText} numberOfLines={2}>
            <Text style={styles.actorName}>{notification.actor?.name}</Text>{" "}
            {cleanMessage}
            {notification.content.giftTitle && (
              <Text style={styles.giftTitle}>
                {" "}
                « {notification.content.giftTitle} »
              </Text>
            )}
          </Text>
          <Text style={styles.timeText}>
            {getTimeAgo(notification.createdAt).toUpperCase()}
          </Text>
        </View>

        <View style={styles.actionArea}>
          <TouchableOpacity
            onPress={handleDelete}
            style={styles.deleteCircle}
            activeOpacity={0.5}
          >
            <Ionicons
              name="close-outline"
              size={14}
              color={THEME.textSecondary}
            />
          </TouchableOpacity>
          <Ionicons name="chevron-forward" size={12} color={THEME.border} />
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
    borderBottomColor: THEME.border,
    backgroundColor: "transparent",
    flexDirection: "row",
  },
  unreadContainer: {
    backgroundColor: THEME.unreadBg,
  },
  unreadStrip: {
    position: "absolute",
    left: 0,
    top: 20,
    bottom: 20,
    width: 3,
    backgroundColor: THEME.accent,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 0, // Architecture luxe : carré
    backgroundColor: "#F2F2F7",
    borderWidth: 0.5,
    borderColor: THEME.border,
  },
  textContent: {
    flex: 1,
    marginLeft: 15,
    marginRight: 10,
  },
  messageText: {
    fontSize: 14,
    color: THEME.textMain,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  actorName: {
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  giftTitle: {
    fontStyle: "italic",
    color: THEME.textSecondary,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  timeText: {
    fontSize: 9,
    color: THEME.textSecondary,
    marginTop: 6,
    fontWeight: "800",
    letterSpacing: 1.2, // Style étiquette luxe
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
