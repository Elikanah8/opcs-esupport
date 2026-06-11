import { useEffect, useRef, useCallback } from "react";

const WS_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")
  .replace(/^http/, "ws");

/**
 * useWebSocket — connects to a Django Channels WebSocket endpoint.
 * Automatically reconnects if the connection drops.
 *
 * @param path   WebSocket path, e.g. "/ws/tickets/"
 * @param onMessage  Called with the parsed JSON data whenever a message arrives
 */
export function useWebSocket(
  path: string,
  onMessage: (data: unknown) => void
) {
  const ws        = useRef<WebSocket | null>(null);
  const reconnect = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active    = useRef(true);

  const stableOnMessage = useRef(onMessage);
  stableOnMessage.current = onMessage;

  const connect = useCallback(() => {
    if (!active.current) return;

    const url = `${WS_BASE}${path}`;
    const socket = new WebSocket(url);
    ws.current = socket;

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        stableOnMessage.current(data);
      } catch { /* ignore malformed messages */ }
    };

    socket.onclose = () => {
      if (active.current) {
        // Auto-reconnect after 3 seconds
        reconnect.current = setTimeout(connect, 3000);
      }
    };

    socket.onerror = () => {
      socket.close();
    };
  }, [path]);

  useEffect(() => {
    active.current = true;
    connect();

    return () => {
      active.current = false;
      if (reconnect.current) clearTimeout(reconnect.current);
      ws.current?.close();
    };
  }, [connect]);
}
