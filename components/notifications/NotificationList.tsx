import React from "react";
import {
  FlatList,
  View,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { NotificationItem } from "./NotificationItem";
import { useNotifications } from "../../hooks/useNotifications";
import { ThemedText } from "@/components/themed-text";
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import ThemedIcon from "@/components/themed-icon";

export const NotificationList = () => {
  const theme = useAppTheme();
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
          <ThemedIcon
            name="notifications-off-outline"
            size={24}
            colorName="accent"
          />
        </View>
        <ThemedText type="hero" style={styles.emptyTitle}>
          Silence radio.
        </ThemedText>
        <ThemedText
          type="subtitle"
          colorName="textSecondary"
          style={styles.emptyText}
        >
          Votre flux d&lsquo;activité est actuellement vierge.
        </ThemedText>
        <View
          style={[styles.decorativeLine, { backgroundColor: theme.accent }]}
        />
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
          tintColor={theme.accent}
        />
      }
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={() =>
        loading && (
          <View style={styles.footer}>
            <ActivityIndicator size="small" color={theme.accent} />
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
    marginBottom: 10,
  },
  emptyText: {
    textAlign: "center",
  },
  decorativeLine: {
    width: 30,
    height: 1,
    marginTop: 25,
    opacity: 0.3,
  },
  footer: { paddingVertical: 30 },
});
