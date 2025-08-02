package ws

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

type WsMessage struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

type MessagePayload struct {
	Message     string `json:"message"`
	PlayerName  string `json:"playerName"`
	PlayerEmoji string `json:"playerEmoji"`
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
	WriteBufferSize: 1024,
}

func parseWebsocketMessage[T any](websocketMessage []byte) (T, error) {
	var msg T
	if err := json.Unmarshal(websocketMessage, &msg); err != nil {
		return msg, err
	}
	return msg, nil
}

func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error upgrading to WebSocket:", err)
		return
	}

	log.Println("WebSocket connection established")

	defer conn.Close()

	for {
		_, websocketMessage, err := conn.ReadMessage()
		if err != nil {
			log.Println("Error reading message:", err)
			return
		}

		log.Printf("Received message: %s", websocketMessage)

		msg, err := parseWebsocketMessage[WsMessage](websocketMessage)
		if err != nil {
			log.Println("Error parsing websocket message:", err)
			continue
		}

		switch msg.Type {
		case "message":
			payload, err := parseWebsocketMessage[MessagePayload](msg.Payload)
			if err != nil {
				log.Println("Error parsing message payload:", err)
				continue
			}
			// log.Printf("Parsed message payload: %+v", payload)
			log.Println("Player Name: ", payload.PlayerName)
		default:
			log.Printf("Unknown message type: %s", msg.Type)
		}
	}
}
