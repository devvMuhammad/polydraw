package main

import (
	"log"
	"net/http"
	"server/internal"
	"server/ws"
)

const PORT = ":8080"

func main() {

	hub := internal.NewHub()

	// hub runs in its own goroutine
	go hub.Run()
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "html/index.html")
	})
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		ws.HandleWebSocket(w, r, hub)
	})
	http.HandleFunc("/players", func(w http.ResponseWriter, r *http.Request) {
		ws.HandleGetPlayers(w, r, hub)
	})

	log.Printf("Server is running on port %s\n", PORT)
	err := http.ListenAndServe(PORT, nil)

	if err != nil {
		log.Fatal(err)
	}
}
