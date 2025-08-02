package main

import (
	"log"
	"net/http"
	"server/ws"
)

const PORT = ":8080"

func main() {

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "html/index.html")
	})
	http.HandleFunc("/ws", ws.HandleWebSocket)

	log.Printf("Server is running on port %s\n", PORT)
	err := http.ListenAndServe(PORT, nil)

	if err != nil {
		log.Fatal(err)
	}
}
