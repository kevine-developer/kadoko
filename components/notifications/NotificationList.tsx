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
import { useAppTheme } from "@/hooks/custom/use-app-theme";
import EmptyContent from "../EmptyContent";

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
      <>
        <EmptyContent
          icon="notifications-off-outline"
          title="Silence radio."
          subtitle="Votre flux d&lsquo;activité est actuellement vierge."
        />
      </>
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
  footer: { paddingVertical: 30 },
});
