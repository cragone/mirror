import { useEffect, useRef, useState, useCallback } from "react";

const WS_URL = "ws://localhost:8000/ws";
const RECONNECT_DELAY_MS = 3000;

type MirrorState = {
  "weather display": boolean;
  "time display": boolean;
};

type WebSocketMessage =
  | { type: "state"; state: MirrorState }
  | { type: "status"; text: string }
  | { type: "error"; message: string }
  | { type: "unknown"; raw: string };

function useWebSocket() {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [mirrorState, setMirrorState] = useState<MirrorState>({
    "weather display": false,
    "time display": false,
  });

  useEffect(() => {
    let cancelled = false;

    function connect() {
      const socket = new WebSocket(WS_URL);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("connected to websocket");
        setIsConnected(true);
      };

      socket.onmessage = (event: MessageEvent<string>) => {
        console.log("message received:", event.data);
        let parsed: WebSocketMessage;

        try {
          const data = JSON.parse(event.data) as Record<string, unknown>;

          if (data.type === "state" && data.state) {
            parsed = { type: "state", state: data.state as MirrorState };
            setMirrorState(data.state as MirrorState);
          } else if (data.type === "status") {
            parsed = { type: "status", text: data.text as string };
          } else if (data.type === "error") {
            parsed = { type: "error", message: data.message as string };
          } else {
            parsed = { type: "unknown", raw: event.data };
          }
        } catch {
          parsed = { type: "unknown", raw: event.data };
        }

        setMessages((prev) => [...prev, parsed]);
      };

      socket.onclose = () => {
        console.log("❌ disconnected");
        setIsConnected(false);
        if (!cancelled) {
          console.log("reconnecting to websocket");
          reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
        }
      };

      socket.onerror = (error) => {
        console.error("websocket error:", error);
      };
    }

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      socketRef.current?.close();
    };
  }, []);

  const sendMessage = useCallback((message: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
    } else {
      console.warn("WebSocket not connected");
    }
  }, []);

  return { messages, sendMessage, isConnected, mirrorState };
}

export { useWebSocket };
export type { WebSocketMessage, MirrorState };
