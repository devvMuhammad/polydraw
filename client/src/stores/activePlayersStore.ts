import { create } from "zustand";

interface ActivePlayer {
    id: string;
    name: string;
    emoji: string;
}

interface ActivePlayersState {
    activePlayers: ActivePlayer[];
    setActivePlayers: (players: ActivePlayer[]) => void;
    connectPlayer: (player: ActivePlayer) => void;
    disconnectPlayer: (player: ActivePlayer) => void;
}

const useActivePlayersStore = create<ActivePlayersState>((set) => ({
    activePlayers: [],
    setActivePlayers: (players) => set({ activePlayers: players }),
    connectPlayer: (player) => set((state) => ({ activePlayers: [...state.activePlayers, player] })),
    disconnectPlayer: (player) => set((state) => ({ activePlayers: state.activePlayers.filter((p) => p.id !== player.id) })),
}));

export default useActivePlayersStore;