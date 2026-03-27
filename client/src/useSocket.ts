import { useEffect, useRef, useState, useCallback } from "react";

const WS_URL = "ws://localhost:8000/ws";

export type CommandName = "weather_display" | "time_display";
export type ActivePanel = "weather" | "time" | null;

export type WebSocketMessage =
  | {
      type: "command";
      command: CommandName;
    }
  | {
      type: "unknown";
      raw: string;
    };

function useWebSocket() {
  const socketRef = useRef<WebSocket | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  useEffect(() => {
    const socket = new WebSocket(WS_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ connected");
      setIsConnected(true);
    };

    socket.onmessage = (event: MessageEvent<string>) => {
      console.log("📩 received:", event.data);

      let parsed: WebSocketMessage;

      try {
        const data = JSON.parse(event.data) as {
          type?: string;
          command?: string;
        };

        if (
          data.type === "command" &&
          (data.command === "weather_display" ||
            data.command === "time_display")
        ) {
          parsed = {
            type: "command",
            command: data.command,
          };
        } else {
          parsed = { type: "unknown", raw: event.data };
        }
      } catch {
        parsed = { type: "unknown", raw: event.data };
      }

      setMessages((prev) => [...prev, parsed]);

      if (parsed.type === "command") {
        if (hideTimerRef.current) {
          clearTimeout(hideTimerRef.current);
        }

        setActivePanel(
          parsed.command === "weather_display" ? "weather" : "time",
        );

        hideTimerRef.current = setTimeout(() => {
          setActivePanel(null);
        }, 10000);
      }
    };

    socket.onclose = () => {
      console.log("❌ disconnected");
      setIsConnected(false);
    };

    socket.onerror = (error) => {
      console.error("⚠️ websocket error:", error);
    };

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
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
    activePanel,
  };
}

export { useWebSocket };
