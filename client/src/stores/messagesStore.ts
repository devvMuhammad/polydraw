import { create } from "zustand";

interface Message {
    id: string;
    playerName: string;
    playerEmoji: string;
    message: string;
    timestamp: Date;
}       

interface MessagesState {
    messages: Message[];
    addMessage: (message: Message) => void;
}

const useMessagesStore = create<MessagesState>((set) => ({
    messages: [],
    addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
}));

export default useMessagesStore;    