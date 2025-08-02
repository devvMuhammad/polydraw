package internal

import (
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
