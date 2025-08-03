import { useEffect } from "react";
import { getSocket, sendMessage } from "../service/websocket";
import { usePlayerStore } from "../stores/playerStore";
import type { Message } from "../types";
const socket = getSocket();

export function usePlayerJoin() {
  const { playerInfo } = usePlayerStore();

  useEffect(() => {
    if (!playerInfo) return;

    console.log("SOCKET", socket)
    console.log("READY STATE", socket.readyState)
    console.log("OPEN NUMBER", WebSocket.OPEN)
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