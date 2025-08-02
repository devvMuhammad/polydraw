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
} | {
    type: "player_join";
    payload: {
        id: string;
        playerName: string;
        playerEmoji: string;
    }
} | {
    type: "player_leave";
    payload: {
        id: string;
        playerName: string;
        playerEmoji: string;
    }
} | {
    type: "draw";
    payload: {
        x: number;
        y: number;
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