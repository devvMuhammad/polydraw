package ws

import (
	"encoding/json"
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

type DrawMessagePayload struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

type PathMessagePayload struct {
	Points []struct {
		X float64 `json:"x"`
		Y float64 `json:"y"`
	} `json:"points"`
	Color       string  `json:"color"`
	StrokeWidth float64 `json:"strokeWidth"`
}

type ClearMessagePayload struct {
	Id          string `json:"id"`
	PlayerName  string `json:"playerName"`
	PlayerEmoji string `json:"playerEmoji"`
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
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
		internal.LogError("Error upgrading to WebSocket: %v", err)
		internal.IncrementWebSocketError("upgrade_failed")
		return
	}

	internal.LogInfo("WebSocket connection established from %s", r.RemoteAddr)
	internal.IncrementWebSocketConnection()

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
		internal.LogInfo("Connection closing for player: %s (%s %s)", player.Id, player.PlayerName, player.PlayerEmoji)
		// Broadcast player leave event before unregistering
		hub.BroadcastPlayerLeave(&player)
		hub.Unregister <- &player
		internal.DecrementWebSocketConnection()
		conn.Close()
	}()

	for {
		_, websocketMessage, err := conn.ReadMessage()
		if err != nil {
			// Check if this is a normal connection close
			if websocket.IsCloseError(err, websocket.CloseGoingAway, websocket.CloseNormalClosure, websocket.CloseNoStatusReceived) {
				internal.LogInfo("WebSocket connection closed normally: %v", err)
			} else {
				internal.LogError("Error reading message: %v", err)
				internal.IncrementWebSocketError("read_failed")
			}
			return
		}

		// show received message with first 50 characters
		internal.LogDebug("Received message: %s", string(websocketMessage[:50]))

		msg, err := parseWebsocketMessage[WsMessage](websocketMessage)
		if err != nil {
			internal.LogError("Error parsing websocket message: %v", err)
			internal.IncrementWebSocketError("parse_failed")
			continue
		}

		// Track received message by type
		internal.IncrementWebSocketMessage(msg.Type)

		switch msg.Type {
		case "join":
			payload, err := parseWebsocketMessage[JoinMessagePayload](msg.Payload)
			if err != nil {
				internal.LogError("Error parsing join payload: %v", err)
				internal.IncrementWebSocketError("parse_failed")
				continue
			}
			// fill missing data
			internal.LogInfo("Player joined with id %s, name: %s, emoji: %s", payload.Id, payload.PlayerName, payload.PlayerEmoji)
			player.Id = payload.Id
			player.PlayerName = payload.PlayerName
			player.PlayerEmoji = payload.PlayerEmoji

			internal.IncrementPlayerJoined()
			hub.BroadcastPlayerJoin(&player)

		case "message":
			payload, err := parseWebsocketMessage[MessagePayload](msg.Payload)
			if err != nil {
				internal.LogError("Error parsing message payload: %v", err)
				internal.IncrementWebSocketError("parse_failed")
				continue
			}
			internal.LogInfo("Player %s sent a chat message", payload.PlayerName)
			internal.IncrementChatMessage()
			hub.Broadcast <- websocketMessage
		case "draw":
			payload, err := parseWebsocketMessage[DrawMessagePayload](msg.Payload)
			if err != nil {
				internal.LogError("Error parsing draw payload: %v", err)
				internal.IncrementWebSocketError("parse_failed")
				continue
			}
			internal.LogDebug("Player %s drawing at (%f, %f)", player.PlayerName, payload.X, payload.Y)
			internal.IncrementDrawEvent()
			hub.BroadcastDraw(&player, payload.X, payload.Y, "", 0)
		case "path":
			payload, err := parseWebsocketMessage[PathMessagePayload](msg.Payload)
			if err != nil {
				internal.LogError("Error parsing path payload: %v", err)
				internal.IncrementWebSocketError("parse_failed")
				continue
			}
			internal.LogDebug("Player %s drawing path with %d points, color: %s, width: %f", player.PlayerName, len(payload.Points), payload.Color, payload.StrokeWidth)
			internal.IncrementPathEvent()
			internal.AddPathPoints(float64(len(payload.Points)))
			hub.BroadcastPath(&player, payload.Points, payload.Color, payload.StrokeWidth)
		case "clear":
			internal.LogInfo("Player %s cleared the canvas", player.PlayerName)
			internal.IncrementClearEvent()
			hub.BroadcastClear(&player)
		default:
			internal.LogWarning("Unknown message type: %s", msg.Type)
		}
	}
}

func HandleGetPlayers(w http.ResponseWriter, r *http.Request, hub *internal.Hub) {
	// Set CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	w.Header().Set("Access-Control-Max-Age", "86400") // 24 hours

	// Handle preflight OPTIONS request
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	players := hub.GetActivePlayers()
	if err := json.NewEncoder(w).Encode(players); err != nil {
		internal.LogError("Error encoding players response: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
}
