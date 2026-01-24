import { authClient } from "../../features/auth/services/auth-client";
import { socketService } from "./socket";
import { getApiUrl } from "../api-config";

export interface Notification {
  id: string;
  type: string;
  userId: string;
  actor?: {
    id: string;
    name: string;
    image?: string | null;
  };
  content: any;
  targetUrl?: string;
  isRead: boolean;
  createdAt: string;
}

class NotificationService {
  private listeners: ((notification: Notification) => void)[] = [];

  async getNotifications(page = 1, limit = 20) {
    const response = await authClient.$fetch(
      getApiUrl(`/notifications?page=${page}&limit=${limit}`),
    );
    if (response.error || !response.data) {
      console.warn("getNotifications failed", response.error);
      return { notifications: [], meta: { totalPages: 0 } };
    }
    return response.data as { notifications: Notification[]; meta: any };
  }

  async getUnreadCount() {
    const response = await authClient.$fetch(
      getApiUrl("/notifications/unread-count"),
    );
    if (response.error || !response.data) {
      // console.warn("getUnreadCount failed", response.error); // Silent fail or warn
      return 0;
    }
    return ((response.data as any).count as number) || 0;
  }

  async markAsRead(id: string) {
    return authClient.$fetch(getApiUrl(`/notifications/${id}/read`), {
      method: "PATCH",
    });
  }

  async markAllAsRead() {
    return authClient.$fetch(getApiUrl("/notifications/read-all"), {
      method: "PATCH",
    });
  }

  async deleteNotification(id: string) {
    return authClient.$fetch(getApiUrl(`/notifications/${id}`), {
      method: "DELETE",
    });
  }

  async deleteAllNotifications() {
    return authClient.$fetch(getApiUrl("/notifications"), {
      method: "DELETE",
    });
  }

  /*
   * Gestion du Socket.IO
   */
  async connectSocket(onNotification: (n: Notification) => void) {
    const session = await authClient.getSession();
    const userId = session.data?.user?.id;

    if (!userId) return;

    socketService.connect(userId);

    socketService.on("notification", (data: any) => {
      onNotification(data);
    });

    this.listeners.push(onNotification);
  }

  disconnectSocket() {
    socketService.off("notification");
    // On ne déconnecte pas le socket global car il peut être utilisé ailleurs (chat, etc.)
    // Mais on pourrait si c'était le seul usage.
    this.listeners = [];
  }
}

export const notificationService = new NotificationService();
