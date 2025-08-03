import { useState } from "react";
import { usePlayerStore } from "../stores/playerStore";
import { sendMessage } from "../service/websocket";
import useMessagesStore from "../stores/messagesStore";
import type { ChatMessage, Message } from "../types";

export function ChatPanel() {
  const { messages } = useMessagesStore();
  const [message, setMessage] = useState("");
  const { playerInfo } = usePlayerStore();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !playerInfo) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      playerName: playerInfo.name,
      playerEmoji: playerInfo.emoji,
      message: message.trim(),
      timestamp: new Date(),
    }

    try {
      await sendMessage({
        type: "message",
        payload: newMessage,
      } as Message);
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
      // Keep the message in the input so user can retry
    }
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
        {messages.map((message) => {
          const isMe = message.playerName === playerInfo?.name;
          return (
            <div
              key={message.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] ${isMe ? "order-2" : "order-1"}`}
              >
                <div
                  className={`rounded-2xl px-4 py-2 ${isMe
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-800"
                    }`}
                >
                  {!isMe && (
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
                  className={`text-xs text-gray-500 mt-1 ${isMe ? "text-right" : "text-left"
                    }`}
                >
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
            maxLength={200}
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-full transition-colors disabled:cursor-not-allowed text-sm font-medium"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
