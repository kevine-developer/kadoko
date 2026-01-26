import React from "react";
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NotificationItem } from "./NotificationItem";
import { useNotifications } from "../../hooks/useNotifications";

const THEME = {
  background: "#FDFBF7",
  textMain: "#1A1A1A",
  textSecondary: "#8E8E93",
  accent: "#AF9062",
};

export const NotificationList = () => {
  const {
    notifications,
    loading,
    hasMore,
    fetchNotifications,
    refresh,
    markAsRead,
    deleteNotification,
  } = useNotifications();

  const handleLoadMore = () => {
    if (!loading && hasMore) fetchNotifications();
  };

  const renderEmpty = () =>
    !loading ? (
      <View style={styles.emptyContainer}>
        <View style={styles.iconCircle}>
          <Ionicons
            name="notifications-off-outline"
            size={24}
            color={THEME.accent}
          />
        </View>
        <Text style={styles.emptyTitle}>Silence radio.</Text>
        <Text style={styles.emptyText}>
          Votre flux d&lsquo;activité est actuellement vierge.
        </Text>
        <View style={styles.decorativeLine} />
      </View>
    ) : null;

  return (
    <FlatList
      data={notifications}
      renderItem={({ item }) => (
        <NotificationItem
          notification={item}
          onPress={(n) => markAsRead(n.id)}
          onDelete={(id) => deleteNotification(id)}
        />
      )}
      keyExtractor={(item) => item.id}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={loading && notifications.length === 0}
          onRefresh={refresh}
          tintColor={THEME.accent}
        />
      }
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={() =>
        loading && (
          <View style={styles.footer}>
            <ActivityIndicator size="small" color={THEME.accent} />
          </View>
        )
      }
      contentContainerStyle={notifications.length === 0 && { flex: 1 }}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 50,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(175, 144, 98, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    color: THEME.textMain,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: THEME.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    fontStyle: "italic",
  },
  decorativeLine: {
    width: 30,
    height: 1,
    backgroundColor: THEME.accent,
    marginTop: 25,
    opacity: 0.3,
  },
  footer: { paddingVertical: 30 },
});
