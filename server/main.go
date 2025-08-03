package main

import (
	"log"
	"net/http"
	"server/internal"
	"server/ws"
)

const PORT = ":8080"

func main() {
	// Initialize logger
	if err := internal.InitLogger(); err != nil {
		log.Fatal("Failed to initialize logger:", err)
	}

	internal.LogInfo("Starting Polydraw server...")

	hub := internal.NewHub()

	// hub runs in its own goroutine
	go hub.Run()
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		internal.LogDebug("Serving index.html to %s", r.RemoteAddr)
		http.ServeFile(w, r, "html/index.html")
	})
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		internal.LogDebug("WebSocket connection request from %s", r.RemoteAddr)
		ws.HandleWebSocket(w, r, hub)
	})
	http.HandleFunc("/players", func(w http.ResponseWriter, r *http.Request) {
		internal.LogDebug("Players list request from %s", r.RemoteAddr)
		ws.HandleGetPlayers(w, r, hub)
	})

	internal.LogInfo("Server is running on port %s", PORT)
	err := http.ListenAndServe(PORT, nil)

	if err != nil {
		internal.LogError("Server failed to start: %v", err)
		log.Fatal(err)
	}
}
