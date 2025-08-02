
import { toast } from "sonner";
import useActivePlayersStore from "../stores/activePlayersStore";
import useMessagesStore from "../stores/messagesStore";
import type { Message, ChatMessage } from "../types";

let ws: WebSocket | null = null;
let messageHandlers: Set<(event: MessageEvent) => void> = new Set();

export function getSocket() {
  if (ws) return ws;

  ws = new WebSocket("ws://localhost:8080/ws");

  ws.onclose = () => {
    console.log("Disconnected from server");
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

export function sendMessage(message: Message) {
  const socket = getSocket();
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  } else {
    console.error("WebSocket is not open");
  }
}
