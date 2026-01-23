import React from "react";
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { NotificationItem } from "./NotificationItem";
import { useNotifications } from "../../hooks/useNotifications";
import { Notification } from "../../lib/services/notification-service";

export const NotificationList = () => {
  const {
    notifications,
    loading,
    hasMore,
    fetchNotifications,
    refresh,
    markAsRead,
  } = useNotifications();

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications();
    }
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <NotificationItem notification={item} onPress={(n) => markAsRead(n.id)} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      {!loading && <Text style={styles.emptyText}>Aucune notification</Text>}
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#888" />
      </View>
    );
  };

  return (
    <FlatList
      data={notifications}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={loading && notifications.length === 0}
          onRefresh={refresh}
        />
      }
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      contentContainerStyle={
        notifications.length === 0 ? styles.centerEmpty : null
      }
      style={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: "#fff",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  centerEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
  },
  footer: {
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
