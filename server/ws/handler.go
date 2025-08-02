package ws

import (
	"encoding/json"
	"log"
	"net/http"
	"server/internal"
	"time"

	"github.com/gorilla/websocket"
)

type WsMessage struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

type JoinMessagePayload struct {
	Id          string `json:"id"`
	PlayerName  string `json:"playerName"`
	PlayerEmoji string `json:"playerEmoji"`
}

type MessagePayload struct {
	Id          string    `json:"id"`
	Message     string    `json:"message"`
	PlayerName  string    `json:"playerName"`
	PlayerEmoji string    `json:"playerEmoji"`
	Timestamp   time.Time `json:"timestamp"`
}

type PlayerEventPayload struct {
	Id          string `json:"id"`
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

func HandleWebSocket(w http.ResponseWriter, r *http.Request, hub *internal.Hub) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error upgrading to WebSocket:", err)
		return
	}

	log.Println("WebSocket connection established")

	// initialize player
	player := internal.Player{
		Id:          "",
		Conn:        conn,
		PlayerName:  "",
		PlayerEmoji: "",
	}

	// Register immediately - no conditions needed
	hub.Register <- &player

	defer func() {
		log.Println("Connection closing for player:", player.Id, player.PlayerName, player.PlayerEmoji)
		// Broadcast player leave event before unregistering
		hub.BroadcastPlayerLeave(&player)
		hub.Unregister <- &player
		conn.Close()
	}()

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
		case "join":
			payload, err := parseWebsocketMessage[JoinMessagePayload](msg.Payload)
			if err != nil {
				log.Println("Error parsing join payload:", err)
				continue
			}
			// fill missing data
			log.Println("Player joined with id", payload.Id, payload.PlayerName, payload.PlayerEmoji)
			player.Id = payload.Id
			player.PlayerName = payload.PlayerName
			player.PlayerEmoji = payload.PlayerEmoji

			// Broadcast player join event to all clients
			joinEvent := WsMessage{
				Type: "player_join",
				Payload: json.RawMessage(func() []byte {
					data, _ := json.Marshal(PlayerEventPayload{
						Id:          payload.Id,
						PlayerName:  payload.PlayerName,
						PlayerEmoji: payload.PlayerEmoji,
					})
					return data
				}()),
			}
			joinEventBytes, _ := json.Marshal(joinEvent)
			hub.Broadcast <- joinEventBytes

		case "message":
			payload, err := parseWebsocketMessage[MessagePayload](msg.Payload)
			if err != nil {
				log.Println("Error parsing message payload:", err)
				continue
			}
			// log.Printf("Parsed message payload: %+v", payload)
			log.Printf("Player Name %s just sent a message\n", payload.PlayerName)
			hub.Broadcast <- websocketMessage
		default:
			log.Printf("Unknown message type: %s", msg.Type)
		}
	}
}

func HandleGetPlayers(w http.ResponseWriter, r *http.Request, hub *internal.Hub) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	players := hub.GetActivePlayers()
	if err := json.NewEncoder(w).Encode(players); err != nil {
		log.Println("Error encoding players response:", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
}
