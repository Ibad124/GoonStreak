import { WebSocket, WebSocketServer } from 'ws';
import { type Server } from 'http';
import { storage } from './storage';
import { type RoomEvent, type Room, type RoomParticipant } from '@shared/schema';

interface ExtendedWebSocket extends WebSocket {
  userId?: number;
  roomId?: number;
  isAlive: boolean;
}

export class WebSocketHandler {
  private wss: WebSocketServer;
  private rooms: Map<number, Set<ExtendedWebSocket>> = new Map();
  private heartbeatInterval: NodeJS.Timeout;

  constructor(server: Server) {
    console.log("Initializing WebSocket server...");
    this.wss = new WebSocketServer({ 
      server, 
      path: "/ws",
      verifyClient: this.verifyClient.bind(this)
    });
    this.setupWebSocketServer();
    this.heartbeatInterval = setInterval(() => this.checkConnections(), 30000);
    console.log("WebSocket server initialization complete");
  }

  private verifyClient(info: { origin: string; req: any; }, callback: (verified: boolean, code?: number, message?: string) => void) {
    console.log("Verifying WebSocket client connection...");
    const cookie = info.req.headers.cookie;
    if (!cookie) {
      console.log("WebSocket connection rejected: No session cookie");
      callback(false, 401, "Unauthorized");
      return;
    }
    // Allow the connection for now, we'll validate the user when they try to join a room
    callback(true);
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocket, req: any) => {
      console.log("New WebSocket connection established");
      const extWs = ws as ExtendedWebSocket;
      extWs.isAlive = true;

      extWs.on('pong', () => {
        extWs.isAlive = true;
      });

      extWs.on('message', async (data: string) => {
        try {
          console.log("Received WebSocket message:", data);
          const event: RoomEvent = JSON.parse(data);
          await this.handleEvent(extWs, event);
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
          extWs.send(JSON.stringify({ 
            type: 'ERROR', 
            payload: { message: 'Invalid message format' } 
          }));
        }
      });

      extWs.on('close', () => {
        console.log("WebSocket connection closed");
        if (extWs.roomId) {
          this.leaveRoom(extWs);
        }
      });

      extWs.on('error', (error) => {
        console.error("WebSocket error:", error);
      });
    });

    this.wss.on('error', (error) => {
      console.error("WebSocket server error:", error);
    });
  }

  private async handleEvent(ws: ExtendedWebSocket, event: RoomEvent) {
    console.log("Handling WebSocket event:", event.type);
    switch (event.type) {
      case 'JOIN_ROOM':
        await this.joinRoom(ws, event.roomId, event.payload);
        break;
      case 'LEAVE_ROOM':
        await this.leaveRoom(ws);
        break;
      case 'SEND_MESSAGE':
        await this.broadcastToRoom(ws.roomId!, {
          type: 'MESSAGE',
          payload: {
            userId: ws.userId,
            content: event.payload.content,
            type: event.payload.type,
          },
          timestamp: new Date(),
        });
        break;
      case 'TIMER_START':
        await this.handleTimerStart(ws, event);
        break;
      case 'TIMER_STOP':
        await this.handleTimerStop(ws, event);
        break;
      case 'STATUS_UPDATE':
        await this.updateParticipantStatus(ws, event.payload.status);
        break;
    }
  }

  private async joinRoom(ws: ExtendedWebSocket, roomId: number, payload: any) {
    console.log("Attempting to join room:", roomId);
    const room = await storage.getRoom(roomId);
    if (!room) {
      ws.send(JSON.stringify({ 
        type: 'ERROR', 
        payload: { message: 'Room not found' } 
      }));
      return;
    }

    // Check room password if it's private
    if (room.isPrivate && room.password !== payload.password) {
      ws.send(JSON.stringify({ 
        type: 'ERROR', 
        payload: { message: 'Invalid room password' } 
      }));
      return;
    }

    // Add to room participants
    const roomParticipants = this.rooms.get(roomId) || new Set();
    roomParticipants.add(ws);
    this.rooms.set(roomId, roomParticipants);
    ws.roomId = roomId;
    ws.userId = payload.userId;

    console.log(`User ${ws.userId} joined room ${roomId}`);

    // Broadcast join event
    this.broadcastToRoom(roomId, {
      type: 'USER_JOINED',
      payload: { userId: ws.userId },
      timestamp: new Date(),
    });

    // Send room state to new participant
    const participants = Array.from(roomParticipants).map(p => ({
      userId: p.userId,
      status: 'active'
    }));

    ws.send(JSON.stringify({
      type: 'ROOM_STATE',
      payload: { room, participants },
      timestamp: new Date(),
    }));
  }

  private async leaveRoom(ws: ExtendedWebSocket) {
    if (!ws.roomId) return;

    console.log(`User ${ws.userId} leaving room ${ws.roomId}`);

    const roomParticipants = this.rooms.get(ws.roomId);
    if (roomParticipants) {
      roomParticipants.delete(ws);
      if (roomParticipants.size === 0) {
        this.rooms.delete(ws.roomId);
        console.log(`Room ${ws.roomId} closed - no participants remaining`);
      }
    }

    // Broadcast leave event
    await this.broadcastToRoom(ws.roomId, {
      type: 'USER_LEFT',
      payload: { userId: ws.userId },
      timestamp: new Date(),
    });

    ws.roomId = undefined;
    ws.userId = undefined;
  }

  private async broadcastToRoom(roomId: number, message: any) {
    console.log(`Broadcasting to room ${roomId}:`, message.type);
    const roomParticipants = this.rooms.get(roomId);
    if (!roomParticipants) return;

    const messageStr = JSON.stringify(message);
    roomParticipants.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  private async handleTimerStart(ws: ExtendedWebSocket, event: RoomEvent) {
    if (!ws.roomId) return;
    console.log(`Timer started in room ${ws.roomId} by user ${ws.userId}`);

    await this.broadcastToRoom(ws.roomId, {
      type: 'TIMER_STARTED',
      payload: {
        duration: event.payload.duration,
        startedBy: ws.userId,
      },
      timestamp: new Date(),
    });
  }

  private async handleTimerStop(ws: ExtendedWebSocket, event: RoomEvent) {
    if (!ws.roomId) return;
    console.log(`Timer stopped in room ${ws.roomId} by user ${ws.userId}`);

    await this.broadcastToRoom(ws.roomId, {
      type: 'TIMER_STOPPED',
      payload: {
        stoppedBy: ws.userId,
      },
      timestamp: new Date(),
    });
  }

  private async updateParticipantStatus(ws: ExtendedWebSocket, status: string) {
    if (!ws.roomId) return;
    console.log(`User ${ws.userId} updated status to ${status} in room ${ws.roomId}`);

    await this.broadcastToRoom(ws.roomId, {
      type: 'STATUS_UPDATED',
      payload: {
        userId: ws.userId,
        status,
      },
      timestamp: new Date(),
    });
  }

  private checkConnections() {
    this.wss.clients.forEach((ws: WebSocket) => {
      const extWs = ws as ExtendedWebSocket;
      if (!extWs.isAlive) {
        console.log(`Terminating inactive connection for user ${extWs.userId}`);
        if (extWs.roomId) {
          this.leaveRoom(extWs);
        }
        return extWs.terminate();
      }

      extWs.isAlive = false;
      extWs.ping();
    });
  }

  public shutdown() {
    console.log("Shutting down WebSocket server...");
    clearInterval(this.heartbeatInterval);
    this.wss.close();
  }
}