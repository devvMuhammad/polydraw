import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PlayerInfo {
  name: string;
  emoji: string;
}

interface PlayerState {
  playerInfo: PlayerInfo | null;
  setPlayerInfo: (info: PlayerInfo) => void;
  clearPlayerInfo: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      playerInfo: null,
      setPlayerInfo: (info) => set({ playerInfo: info }),
      clearPlayerInfo: () => set({ playerInfo: null }),
    }),
    {
      name: "playerInfo",
    }
  )
);
