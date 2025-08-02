package internal

import (
	"encoding/json"
	"fmt"

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
	fmt.Println("Hub running in its goroutine")
	for {
		select {
		case newConnection := <-h.Register:
			fmt.Println("New connection registered")
			h.Players[newConnection.Conn] = newConnection
		case disconnectedConnection := <-h.Unregister:
			fmt.Println("Connection unregistered")
			delete(h.Players, disconnectedConnection.Conn)
		case message := <-h.Broadcast:
			fmt.Println("Broadcasting message")
			for conn := range h.Players {
				if err := conn.WriteMessage(websocket.TextMessage, message); err != nil {
					fmt.Printf("Error broadcasting to connection: %v\n", err)
					// Auto cleanup on write error
					delete(h.Players, conn)
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
		leaveEventData := map[string]interface{}{
			"type": "player_leave",
			"payload": map[string]interface{}{
				"id":          player.Id,
				"playerName":  player.PlayerName,
				"playerEmoji": player.PlayerEmoji,
			},
		}

		leaveEventBytes, err := json.Marshal(leaveEventData)
		if err != nil {
			fmt.Printf("Error marshaling leave event: %v\n", err)
			return
		}

		h.Broadcast <- leaveEventBytes
	}
}
