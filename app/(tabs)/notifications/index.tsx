import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NotificationList } from "@/components/notifications/NotificationList";
import { useNotifications } from "@/hooks/useNotifications";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";

// --- THEME ÉDITORIAL ---

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* NAV BAR MINIMALISTE */}
      <View
        style={[
          styles.navBar,
          { paddingTop: insets.top + 10, backgroundColor: theme.background },
        ]}
      >
        <TouchableOpacity
          onPress={handleMarkAll}
          style={[
            styles.markAllAction,
            notifications.length === 0 && { opacity: 0.3 },
          ]}
          disabled={notifications.length === 0}
        >
          <ThemedText
            type="label"
            colorName="accent"
            style={styles.markAllActionText}
          >
            TOUT LIRE
          </ThemedText>
        </TouchableOpacity>
        <View style={[styles.navDivider, { backgroundColor: theme.border }]} />
        <TouchableOpacity
          onPress={handleDeleteAll}
          style={[
            styles.markAllAction,
            notifications.length === 0 && { opacity: 0.3 },
          ]}
          disabled={notifications.length === 0}
        >
          <ThemedText
            type="label"
            style={[styles.markAllActionText, { color: "#FF3B30" }]}
          >
            TOUT SUPPRIMER
          </ThemedText>
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
          <ThemedText type="hero" style={styles.heroTitle}>
            Notifications.
          </ThemedText>
          <View
            style={[styles.titleDivider, { backgroundColor: theme.accent }]}
          />
          <ThemedText
            type="subtitle"
            colorName="textSecondary"
            style={styles.heroSubtitle}
          >
            Restez informé des intentions et des attentions de votre cercle.
          </ThemedText>
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
  },
  /* NAV BAR */
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  navBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  navTitle: {
    fontSize: 10,
    letterSpacing: 2,
  },
  markAllAction: {
    paddingHorizontal: 10,
    height: 44,
    justifyContent: "center",
  },
  markAllActionText: {
    fontSize: 10,
    letterSpacing: 1,
  },
  navDivider: {
    width: 1,
    height: 12,
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
    letterSpacing: -1,
  },
  titleDivider: {
    width: 35,
    height: 2,
    marginVertical: 20,
  },
  heroSubtitle: {},
});
