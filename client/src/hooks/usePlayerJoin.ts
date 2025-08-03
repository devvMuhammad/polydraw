import { useEffect } from "react";
import { getSocket, sendMessage } from "../service/websocket";
import { usePlayerStore } from "../stores/playerStore";
import type { Message } from "../types";

export function usePlayerJoin() {
  const { playerInfo } = usePlayerStore();

  useEffect(() => {
    if (!playerInfo) return;

    const socket = getSocket();

    // If already connected, send message immediately
    if (socket.readyState === WebSocket.OPEN) {
      console.log("SENDING JOIN MESSAGE", playerInfo);
      sendMessage({
        type: "join",
        payload: {
          id: playerInfo.id,
          playerName: playerInfo.name,
          playerEmoji: playerInfo.emoji,
        }
      } as Message).catch(error => {
        console.error("Failed to send join message:", error);
      });
      return;
    }

    // If not connected, wait for connection and then send message
    const handleOpen = () => {
      console.log("WebSocket connected, sending join message");
      sendMessage({
        type: "join",
        payload: {
          id: playerInfo.id,
          playerName: playerInfo.name,
          playerEmoji: playerInfo.emoji,
        }
      } as Message).catch(error => {
        console.error("Failed to send join message:", error);
      });
    };

    socket.addEventListener('open', handleOpen);

    return () => {
      socket.removeEventListener('open', handleOpen);
    };
  }, [playerInfo]);
}