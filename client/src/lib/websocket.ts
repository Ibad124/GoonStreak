// Create WebSocket client utility
let socket: WebSocket | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;

export function setupWebSocket() {
  if (socket?.readyState === WebSocket.OPEN) return;

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;

  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log('Connected to WebSocket');
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  socket.onclose = () => {
    console.log('WebSocket connection closed. Reconnecting...');
    socket = null;
    // Attempt to reconnect after 5 seconds
    reconnectTimer = setTimeout(setupWebSocket, 5000);
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  return socket;
}

export function sendWebSocketMessage(type: string, data: any) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type, data }));
  } else {
    console.error('WebSocket is not connected');
  }
}
