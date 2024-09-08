import { WebSocketServer } from 'ws';

let wss;

// WebSocket route
export async function GET(request) {
  if (!wss) {
    // Create WebSocket server if it doesn't exist
    wss = new WebSocketServer({ noServer: true });
  }

  // Upgrade HTTP request to WebSocket
  return new Response(null, {
    status: 101,
    webSocket: wss,
  });
}

// Function to broadcast messages to all connected WebSocket clients
export function broadcastMessage(message) {
  if (wss) {
    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}
