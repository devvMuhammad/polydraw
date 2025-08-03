import { useEffect } from "react";
import { getSocket, sendMessage } from "../service/websocket";
import { usePlayerStore } from "../stores/playerStore";
import type { Message } from "../types";

export function usePlayerJoin() {
  const { playerInfo } = usePlayerStore();

  useEffect(() => {
    if (!playerInfo) return;

    const socket = getSocket();

    if (socket.readyState !== WebSocket.OPEN) return;

    console.log("SENDING JOIN MESSAGE", playerInfo)
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


  }, [playerInfo]);

}