import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NotificationList } from "@/components/notifications/NotificationList";
import { useNotifications } from "@/hooks/useNotifications";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";

// --- THEME ÉDITORIAL COHÉRENT ---
const THEME = {
  background: "#FDFBF7", // Bone Silk
  surface: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062", // Or brossé
  border: "rgba(0,0,0,0.08)",
};

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { markAllAsRead, deleteAllNotifications, notifications } =
    useNotifications();

  const handleMarkAll = () => {
    if (notifications.length === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    markAllAsRead();
  };

  const handleDeleteAll = () => {
    if (notifications.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    deleteAllNotifications();
  };

  return (
    <View style={styles.container}>
      {/* NAV BAR MINIMALISTE */}
      <View style={[styles.navBar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={handleMarkAll}
          style={[
            styles.markAllAction,
            notifications.length === 0 && { opacity: 0.3 },
          ]}
          disabled={notifications.length === 0}
        >
          <Text style={styles.markAllActionText}>TOUT LIRE</Text>
        </TouchableOpacity>
        <View style={styles.navDivider} />
        <TouchableOpacity
          onPress={handleDeleteAll}
          style={[
            styles.markAllAction,
            notifications.length === 0 && { opacity: 0.3 },
          ]}
          disabled={notifications.length === 0}
        >
          <Text style={[styles.markAllActionText, { color: "#FF3B30" }]}>
            TOUT SUPPRIMER
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* HERO SECTION */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 600 }}
          style={styles.heroSection}
        >
          <Text style={styles.heroTitle}>Notifications.</Text>
          <View style={styles.titleDivider} />
          <Text style={styles.heroSubtitle}>
            Restez informé des intentions et des attentions de votre cercle.
          </Text>
        </MotiView>

        {/* LISTE DE NOTIFICATIONS STYLE REGISTRE */}
        <View style={{ flex: 1 }}>
          <NotificationList />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  /* NAV BAR */
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: THEME.background,
  },
  navBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  navTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.textMain,
    letterSpacing: 2,
  },
  markAllAction: {
    paddingHorizontal: 10,
    height: 44,
    justifyContent: "center",
  },
  markAllActionText: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.accent,
    letterSpacing: 1,
  },
  navDivider: {
    width: 1,
    height: 12,
    backgroundColor: THEME.border,
    marginHorizontal: 5,
  },
  /* CONTENT */
  content: {
    flex: 1,
  },
  heroSection: {
    paddingHorizontal: 32,
    marginTop: 20,
    marginBottom: 30,
  },
  heroTitle: {
    fontSize: 38,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: THEME.textMain,
    letterSpacing: -1,
  },
  titleDivider: {
    width: 35,
    height: 2,
    backgroundColor: THEME.accent,
    marginVertical: 20,
  },
  heroSubtitle: {
    fontSize: 14,
    color: THEME.textSecondary,
    lineHeight: 22,
    fontStyle: "italic",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
});
