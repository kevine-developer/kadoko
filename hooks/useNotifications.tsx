import { useState, useEffect, useCallback } from "react";
import {
  Notification,
  notificationService,
} from "../lib/services/notification-service";
import { useFocusEffect } from "expo-router";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = useCallback(
    async (reset = false) => {
      try {
        if (reset) {
          setLoading(true);
          setPage(1);
        }

        const currentPage = reset ? 1 : page;
        const result = await notificationService.getNotifications(currentPage);

        if (reset) {
          setNotifications(result.notifications);
        } else {
          setNotifications((prev) => [...prev, ...result.notifications]);
        }

        setHasMore(currentPage < result.meta.totalPages);
        if (!reset) setPage((p) => p + 1);

        // Mise à jour du compteur
        const count = await notificationService.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error("Erreur chargement notifications", error);
      } finally {
        setLoading(false);
      }
    },
    [page],
  );

  const markAsRead = async (id: string) => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));

      await notificationService.markAsRead(id);
    } catch (error) {
      console.error("Erreur markAsRead", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      await notificationService.markAllAsRead();
    } catch (error) {
      console.error("Erreur markAllAsRead", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      await notificationService.deleteNotification(id);
    } catch (error) {
      console.error("Erreur deleteNotification", error);
    }
  };

  // Initial load & Socket connection
  useEffect(() => {
    fetchNotifications(true);

    const onNewNotification = (n: Notification) => {
      setNotifications((prev) => [n, ...prev]);
      setUnreadCount((c) => c + 1);
    };

    notificationService.connectSocket(onNewNotification);

    return () => {
      notificationService.disconnectSocket();
    };
  }, []);

  // Refresh on focus (optionnel, si on veut être sûr)
  useFocusEffect(
    useCallback(() => {
      notificationService.getUnreadCount().then(setUnreadCount);
    }, []),
  );

  return {
    notifications,
    unreadCount,
    loading,
    hasMore,
    fetchNotifications, // loadMore
    refresh: () => fetchNotifications(true),
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};
