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
	Players    map[string]*Player
	Broadcast  chan []byte
	Register   chan *Player
	Unregister chan *Player
}

func NewHub() *Hub {
	return &Hub{
		Players:    make(map[string]*Player),
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
			h.Players[newConnection.Id] = newConnection
		case disconnectedConnection := <-h.Unregister:
			fmt.Println("Connection unregistered")
			delete(h.Players, disconnectedConnection.Id)
		case message := <-h.Broadcast:
			fmt.Println("Broadcasting message")
			for _, player := range h.Players {
				player.Conn.WriteMessage(websocket.TextMessage, message)
			}
		}
	}
}
