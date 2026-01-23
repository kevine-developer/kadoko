import { io, Socket } from "socket.io-client";
// import { config } from "@/config/env"; // Si alias marche pas

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;

  init(userId: string) {
    if (this.socket?.connected && this.userId === userId) return;

    this.userId = userId;

    this.socket = io(API_URL, {
      query: { userId },
      transports: ["websocket"],
      autoConnect: true,
    });

    this.socket.on("connect", () => {
      console.log("Socket connected");
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  }

  on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (data: any) => void) {
    this.socket?.off(event, callback);
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.userId = null;
  }
}

export const socketService = new SocketService();
