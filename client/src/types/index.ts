export type Message = {
    type: "message";
    payload: ChatMessage
} | {
    type: "join";
    payload: {
        id: string;
        playerName: string;
        playerEmoji: string;
    }
};

export interface ChatMessage {
    id: string;
    playerName: string;
    playerEmoji: string;
    message: string;
    timestamp: Date;
}