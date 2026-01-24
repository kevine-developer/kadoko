import { useState, useEffect, useCallback } from "react";
import {
  Notification,
  notificationService,
} from "../lib/services/notification-service";
import { useFocusEffect } from "expo-router";
import { authClient } from "@/features/auth";

export const useNotifications = () => {
  const { data: session } = authClient.useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = useCallback(
    async (reset = false) => {
      try {
        if (reset) {
          setLoading(true);
        }

        // Utiliser une variable locale pour capturer la page actuelle
        // ou passer par l'état précédent si on veut incrémenter
        let pageToFetch = 1;
        if (!reset) {
          setPage((p) => {
            pageToFetch = p;
            return p;
          });
        } else {
          setPage(1);
        }

        const result = await notificationService.getNotifications(pageToFetch);

        if (reset) {
          setNotifications(result.notifications);
        } else {
          setNotifications((prev) => [...prev, ...result.notifications]);
          setPage((p) => p + 1);
        }

        setHasMore(pageToFetch < result.meta.totalPages);

        // Mise à jour du compteur
        const count = await notificationService.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error("Erreur chargement notifications", error);
      } finally {
        setLoading(false);
      }
    },
    [], // Ne dépend plus de page
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

  const deleteAllNotifications = async () => {
    try {
      setNotifications([]);
      setUnreadCount(0);
      await notificationService.deleteAllNotifications();
    } catch (error) {
      console.error("Erreur deleteAllNotifications", error);
    }
  };

  // Initial load
  useEffect(() => {
    if (!session) return;
    fetchNotifications(true);
  }, [session, fetchNotifications]);

  // Socket connection (séparé pour être plus stable)
  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    const onNewNotification = (n: Notification) => {
      setNotifications((prev) => [n, ...prev]);
      setUnreadCount((c) => c + 1);
    };

    notificationService.connectSocket(onNewNotification);

    return () => {
      notificationService.disconnectSocket();
    };
  }, [session?.user?.id]); // Ne dépend que de l'ID utilisateur

  // Refresh on focus (optionnel, si on veut être sûr)
  useFocusEffect(
    useCallback(() => {
      if (!session) return;
      notificationService.getUnreadCount().then(setUnreadCount);
    }, [session]),
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
    deleteAllNotifications,
  };
};
