import { useState } from "react";
import { usePlayerStore } from "../stores/playerStore";

interface ChatMessage {
  id: string;
  playerName: string;
  playerEmoji: string;
  message: string;
  timestamp: Date;
  isMe: boolean;
}

// Dummy chat messages for demonstration
const dummyMessages: ChatMessage[] = []

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>(dummyMessages);
  const [newMessage, setNewMessage] = useState("");
  const { playerInfo } = usePlayerStore();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !playerInfo) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      playerName: "You",
      playerEmoji: playerInfo.emoji,
      message: newMessage.trim(),
      timestamp: new Date(),
      isMe: true,
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800">Chat</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] ${message.isMe ? "order-2" : "order-1"}`}
            >
              <div
                className={`rounded-2xl px-4 py-2 ${message.isMe
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800"
                  }`}
              >
                {!message.isMe && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{message.playerEmoji}</span>
                    <span className="text-xs font-medium opacity-70">
                      {message.playerName}
                    </span>
                  </div>
                )}
                <p className="text-sm leading-relaxed">{message.message}</p>
              </div>
              <div
                className={`text-xs text-gray-500 mt-1 ${message.isMe ? "text-right" : "text-left"
                  }`}
              >
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
            maxLength={200}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-full transition-colors disabled:cursor-not-allowed text-sm font-medium"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
