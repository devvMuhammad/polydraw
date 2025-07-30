import { createContext, useContext, useState, ReactNode } from "react";

interface PlayerInfo {
  name: string;
  emoji: string;
}

interface PlayerContextType {
  playerInfo: PlayerInfo | null;
  setPlayerInfo: (info: PlayerInfo) => void;
  clearPlayerInfo: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [playerInfo, setPlayerInfoState] = useState<PlayerInfo | null>(() => {
    // Try to load from localStorage on initialization
    const saved = localStorage.getItem("playerInfo");
    return saved ? JSON.parse(saved) : null;
  });

  const setPlayerInfo = (info: PlayerInfo) => {
    setPlayerInfoState(info);
    localStorage.setItem("playerInfo", JSON.stringify(info));
  };

  const clearPlayerInfo = () => {
    setPlayerInfoState(null);
    localStorage.removeItem("playerInfo");
  };

  return (
    <PlayerContext.Provider
      value={{ playerInfo, setPlayerInfo, clearPlayerInfo }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
