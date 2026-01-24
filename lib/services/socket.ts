import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL;

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private userId: string | null = null;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect(userId?: string) {
    // Si déjà connecté avec le même userId, on ne fait rien
    if (
      this.socket?.connected &&
      (userId === undefined || this.userId === userId)
    ) {
      return;
    }

    // Déconnexion si on change de userId
    if (this.socket && this.userId !== userId) {
      this.disconnect();
    }

    this.userId = userId || null;

    this.socket = io(SOCKET_URL, {
      query: userId ? { userId } : {},
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
    });

    this.socket.on("connect", () => {
      console.log(
        "Socket connected:",
        this.socket?.id,
        "for user:",
        this.userId,
      );
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
    }
  }

  public on(event: string, callback: (...args: any[]) => void) {
    if (!this.socket) {
      console.warn("Socket not connected when trying to listen to:", event);
      return;
    }
    this.socket.on(event, callback);
  }

  public off(event: string, callback?: (...args: any[]) => void) {
    this.socket?.off(event, callback);
  }

  public emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }
}

export const socketService = SocketService.getInstance();
