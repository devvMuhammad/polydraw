
import { toast } from "sonner";
import useActivePlayersStore from "../stores/activePlayersStore";
import useMessagesStore from "../stores/messagesStore";
import type { Message, ChatMessage } from "../types";

let ws: WebSocket | null = null;
let messageHandlers: Set<(event: MessageEvent) => void> = new Set();
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
const baseDelay = 1000;
let isReconnecting = false;

function getWebSocketUrl(): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = import.meta.env.VITE_WS_HOST || window.location.hostname + ':8080';
  return `${protocol}//${host}/ws`;
}

function setupWebSocketHandlers() {
  if (!ws) return;

  ws.onopen = () => {
    console.log("Connected to server");
    reconnectAttempts = 0;
    isReconnecting = false;
  };

  ws.onclose = (event) => {
    console.log("Disconnected from server");

    if (!event.wasClean && !isReconnecting) {
      attemptReconnect();
    }
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as Message;
      console.log("Message from server", data);

      // Handle different message types
      switch (data.type) {
        case "message":
          const payload = data.payload as ChatMessage;
          payload.timestamp = new Date(payload.timestamp);
          useMessagesStore.getState().addMessage(payload);
          break;

        case "player_join":
          const joinPayload = data.payload;
          useActivePlayersStore.getState().connectPlayer({
            id: joinPayload.id,
            playerName: joinPayload.playerName,
            playerEmoji: joinPayload.playerEmoji,
          });
          toast.success(`${joinPayload.playerEmoji} ${joinPayload.playerName} joined the game!`);
          break;

        case "player_leave":
          const leavePayload = data.payload;
          useActivePlayersStore.getState().disconnectPlayer({
            id: leavePayload.id,
            playerName: leavePayload.playerName,
            playerEmoji: leavePayload.playerEmoji,
          });
          toast.info(`${leavePayload.playerEmoji} ${leavePayload.playerName} left the game`);
          break;

        default:
          console.log("Unknown message type:", data.type);
      }

      // Call additional message handlers
      messageHandlers.forEach(handler => handler(event));
    } catch (error) {
      console.error("Error parsing websocket message:", error);
    }
  };
}

function attemptReconnect() {
  if (isReconnecting || reconnectAttempts >= maxReconnectAttempts) {
    if (reconnectAttempts >= maxReconnectAttempts) {
      toast.error("Unable to connect to server. Please refresh the page.");
    }
    return;
  }

  isReconnecting = true;
  toast.warning("Connection lost. Attempting to reconnect...", {
    style: {
      background: '#FEF3C7', // yellowish background
      color: '#92400E', // darker yellow text
      border: '1px solid #F59E0B'
    }
  });

  const delay = baseDelay * Math.pow(2, reconnectAttempts);

  setTimeout(() => {
    reconnectAttempts++;
    console.log(`Reconnection attempt ${reconnectAttempts}/${maxReconnectAttempts}`);

    ws = new WebSocket(getWebSocketUrl());
    setupWebSocketHandlers();
  }, delay);
}

export function getSocket() {
  if (ws) return ws;

  ws = new WebSocket(getWebSocketUrl());
  setupWebSocketHandlers();

  return ws;
}

export function closeSocket() {
  if (ws) {
    ws.close();
    ws = null;
  }
}

export function addMessageHandler(handler: (event: MessageEvent) => void) {
  messageHandlers.add(handler);
  return () => messageHandlers.delete(handler);
}

export function sendMessage(message: Message): Promise<void> {
  return new Promise((resolve, reject) => {
    const socket = getSocket();

    if (socket.readyState !== WebSocket.OPEN) {
      reject(new Error('WebSocket is not connected'));
      return;
    }

    try {
      socket.send(JSON.stringify(message));
      resolve();
    } catch (error) {
      console.error("Error sending message:", error);
      reject(error);
    }
  });
}
