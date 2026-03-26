import { useEffect, useRef, useState, useCallback } from "react";

const WS_URL = "ws://localhost:8000/ws";

function useWebSocket() {
  const socketRef = useRef<WebSocket | null>(null);

  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = new WebSocket(WS_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ connected");
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      console.log("📩 received:", event.data);
      setMessages((prev) => [...prev, event.data]);
    };

    socket.onclose = () => {
      console.log("❌ disconnected");
      setIsConnected(false);
    };

    socket.onerror = (error) => {
      console.error("⚠️ websocket error:", error);
    };

    return () => {
      socket.close();
    };
  }, []);

  const sendMessage = useCallback((message: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
    } else {
      console.warn("WebSocket not connected");
    }
  }, []);

  return {
    messages,
    sendMessage,
    isConnected,
  };
}

export { useWebSocket };
