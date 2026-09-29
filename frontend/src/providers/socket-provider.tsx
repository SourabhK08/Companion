"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks/use-auth";
import { getAccessToken } from "@/lib/api/client";

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  onlineUsers: new Set(),
});

/**
 * SocketProvider manages the Socket.IO connection lifecycle.
 * It connects when the user is authenticated and disconnects on logout.
 */
export function SocketProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      // Disconnect if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
        setOnlineUsers(new Set());
      }
      return;
    }

    // Get the access token from cookie (we'll read it from the API)
    const accessToken = getAccessToken();
    if (!accessToken) return;

    // Connect to Socket.IO server
    const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001", {
      auth: { token: accessToken },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 Socket connected:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
      setIsConnected(false);
    });

    // Online users tracking
    socket.on("online_users", ({ userIds }: { userIds: string[] }) => {
      setOnlineUsers(new Set(userIds));
    });

    socket.on("user_online", ({ userId }: { userId: string }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    socket.on("user_offline", ({ userId }: { userId: string }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        onlineUsers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
