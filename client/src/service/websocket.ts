
let ws: WebSocket | null = null;

export function getSocket() {

  if (ws) return ws;

  ws = new WebSocket("ws://localhost:8080/ws");

  ws.onclose = () => {
    console.log("Disconnected from server");
  };

  return ws;
}

export function closeSocket() {
  if (ws) {
    ws.close();
    ws = null;
  }
}

