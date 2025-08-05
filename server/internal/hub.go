package internal

import (
	"encoding/json"

	"github.com/gorilla/websocket"
)

type Player struct {
	Id          string `json:"id"`
	PlayerName  string `json:"playerName"`
	PlayerEmoji string `json:"playerEmoji"`
	Conn        *websocket.Conn
}

type Hub struct {
	Players    map[*websocket.Conn]*Player
	Broadcast  chan []byte
	Register   chan *Player
	Unregister chan *Player
}

func NewHub() *Hub {
	return &Hub{
		Players:    make(map[*websocket.Conn]*Player),
		Broadcast:  make(chan []byte),
		Register:   make(chan *Player),
		Unregister: make(chan *Player),
	}
}

func (h *Hub) Run() {
	LogInfo("Hub running in its goroutine")
	for {
		select {
		case newConnection := <-h.Register:
			LogInfo("New connection registered")
			h.Players[newConnection.Conn] = newConnection
			// Update active players count (this includes connections that haven't completed join)
			SetActivePlayersCount(float64(len(h.GetActivePlayers())))
		case disconnectedConnection := <-h.Unregister:
			LogInfo("Connection unregistered")
			// Check if this was a fully joined player before deletion
			if disconnectedConnection.Id != "" && disconnectedConnection.PlayerName != "" && disconnectedConnection.PlayerEmoji != "" {
				IncrementPlayerLeft()
			}
			delete(h.Players, disconnectedConnection.Conn)
			// Update active players count
			SetActivePlayersCount(float64(len(h.GetActivePlayers())))
		case message := <-h.Broadcast:
			LogDebug("Broadcasting message")

			// unmarshal message
			var messageData map[string]any
			if err := json.Unmarshal(message, &messageData); err != nil {
				LogError("Error unmarshalling message: %v", err)
				continue
			}

			for conn, player := range h.Players {
				// skip if message is a draw, path, or player join message and the player is the one who did it (handling it special for this case)
				if messageData["type"] == "draw" || messageData["type"] == "path" || messageData["type"] == "player_join" || messageData["type"] == "player_leave" {
					playerId := messageData["payload"].(map[string]any)["id"].(string)
					if playerId == player.Id {
						continue
					}
				}
				if err := conn.WriteMessage(websocket.TextMessage, message); err != nil {
					LogError("Error broadcasting to connection: %v", err)
					IncrementWebSocketError("broadcast_failed")
					// Auto cleanup on write error
					delete(h.Players, conn)
				} else {
					IncrementWebSocketMessageSent()
				}
			}
		}
	}
}

func (h *Hub) GetActivePlayers() []Player {
	var players []Player
	for _, player := range h.Players {
		// Only include players that have completed the join process
		if player.Id != "" && player.PlayerName != "" && player.PlayerEmoji != "" {
			players = append(players, Player{
				Id:          player.Id,
				PlayerName:  player.PlayerName,
				PlayerEmoji: player.PlayerEmoji,
			})
		}
	}
	return players
}

func (h *Hub) BroadcastPlayerLeave(player *Player) {
	if player.Id != "" && player.PlayerName != "" && player.PlayerEmoji != "" {
		// Create player leave event
		leaveEventData := map[string]any{
			"type": "player_leave",
			"payload": map[string]any{
				"id":          player.Id,
				"playerName":  player.PlayerName,
				"playerEmoji": player.PlayerEmoji,
			},
		}

		leaveEventBytes, err := json.Marshal(leaveEventData)
		if err != nil {
			LogError("Error marshaling leave event: %v", err)
			return
		}

		h.Broadcast <- leaveEventBytes
	}
}

func (h *Hub) BroadcastPlayerJoin(player *Player) {
	if player.Id != "" && player.PlayerName != "" && player.PlayerEmoji != "" {
		// Create player join event
		joinEventData := map[string]any{
			"type": "player_join",
			"payload": map[string]any{
				"id":          player.Id,
				"playerName":  player.PlayerName,
				"playerEmoji": player.PlayerEmoji,
			},
		}

		joinEventBytes, err := json.Marshal(joinEventData)
		if err != nil {
			LogError("Error marshaling join event: %v", err)
			return
		}

		h.Broadcast <- joinEventBytes
	}
}

func (h *Hub) BroadcastDraw(player *Player, x float64, y float64, color string, strokeWidth float64) {
	if player.Id != "" && player.PlayerName != "" && player.PlayerEmoji != "" {
		// Create draw event
		drawEventData := map[string]any{
			"type": "draw",
			"payload": map[string]any{
				"id":          player.Id,
				"playerName":  player.PlayerName,
				"playerEmoji": player.PlayerEmoji,
				"x":           x,
				"y":           y,
				"color":       color,
				"strokeWidth": strokeWidth,
			},
		}

		drawEventBytes, err := json.Marshal(drawEventData)
		if err != nil {
			LogError("Error marshaling draw event: %v", err)
			return
		}

		h.Broadcast <- drawEventBytes
	}
}

func (h *Hub) BroadcastPath(player *Player, points []struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}, color string, strokeWidth float64) {
	if player.Id != "" && player.PlayerName != "" && player.PlayerEmoji != "" {
		// Create path event
		pathEventData := map[string]any{
			"type": "path",
			"payload": map[string]any{
				"id":          player.Id,
				"playerName":  player.PlayerName,
				"playerEmoji": player.PlayerEmoji,
				"points":      points,
				"color":       color,
				"strokeWidth": strokeWidth,
			},
		}

		pathEventBytes, err := json.Marshal(pathEventData)
		if err != nil {
			LogError("Error marshaling path event: %v", err)
			return
		}

		h.Broadcast <- pathEventBytes
	}
}

func (h *Hub) BroadcastClear(player *Player) {
	if player.Id != "" && player.PlayerName != "" && player.PlayerEmoji != "" {
		// Create clear event
		clearEventData := map[string]any{
			"type": "clear",
			"payload": map[string]any{
				"id":          player.Id,
				"playerName":  player.PlayerName,
				"playerEmoji": player.PlayerEmoji,
			},
		}

		clearEventBytes, err := json.Marshal(clearEventData)
		if err != nil {
			LogError("Error marshaling clear event: %v", err)
			return
		}

		h.Broadcast <- clearEventBytes
	}
}
