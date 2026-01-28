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
      console.log("[Socket] Déjà connecté...");
      return;
    }

    // Déconnexion si on change de userId
    if (this.socket && this.userId !== userId) {
      console.log("[Socket] Changement d'utilisateur, déconnexion forcée");
      this.disconnect();
    }

    this.userId = userId || null;

    console.log("[Socket] Tentative de connexion à:", SOCKET_URL);
    this.socket = io(SOCKET_URL, {
      query: userId ? { userId } : {},
      transports: ["websocket", "polling"], // On autorise le polling en fallback
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log(
        `[Socket] 🟢 Connecté! ID: ${this.socket?.id} | User: ${this.userId}`,
      );
    });

    this.socket.on("connect_error", (error) => {
      console.warn("[Socket] ⚠️ Erreur de connexion:", error.message);
    });

    this.socket.on("disconnect", (reason) => {
      console.log(`[Socket] 🔴 Déconnecté | Raison: ${reason}`);
      // Si la déconnexion vient du serveur, Socket.io tentera de se reconnecter automatiquement
      // sauf si la raison est "io client disconnect"
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
