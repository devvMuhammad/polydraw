import { toast } from "sonner";

let ws: WebSocket | null = null;

export function getSocket() {
  ws = new WebSocket("ws://localhost:8080/ws");

  ws.onopen = () => {
    console.log("Connected to server");
  };

  ws.onmessage = (event) => {
    console.log("Message from server", event.data);
    toast.success("Message from server", {
      description: event.data,
    });
  }

  ws.onerror = (event) => {
    console.error("Error from server", event);
    toast.error("Error from server");
  };

  ws.onclose = () => {
    console.log("Disconnected from server");
  };

  return ws;
}

