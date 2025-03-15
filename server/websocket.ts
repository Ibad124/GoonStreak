import { WebSocket, WebSocketServer } from 'ws';
import { type Server } from 'http';
import { storage } from './storage';
import { type RoomEvent, type Room, type RoomParticipant } from '@shared/schema';

interface ExtendedWebSocket extends WebSocket {
  userId?: number;
  roomId?: number;
  isAlive: boolean;
}

interface VideoState {
  currentTime: number;
  isPlaying: boolean;
  timestamp: Date;
}

export class WebSocketHandler {
  private wss: WebSocketServer;
  private rooms: Map<number, Set<ExtendedWebSocket>> = new Map();
  private videoStates: Map<number, VideoState> = new Map();
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
      case 'VIDEO_UPDATE':
        await this.handleVideoUpdate(ws, event.payload);
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
      case 'STATUS_UPDATE':
        await this.updateParticipantStatus(ws, event.payload.status);
        break;
      case 'TIMER_START':
        await this.handleTimerStart(ws, event);
        break;
      case 'TIMER_STOP':
        await this.handleTimerStop(ws, event);
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
      payload: {
        userId: ws.userId,
        username: payload.username,
      },
      timestamp: new Date(),
    });

    // Send room state to new participant
    const participants = Array.from(roomParticipants).map(p => ({
      userId: p.userId,
      status: 'active'
    }));

    // Send current video state if exists
    const videoState = this.videoStates.get(roomId);

    ws.send(JSON.stringify({
      type: 'ROOM_STATE',
      payload: { 
        room,
        participants,
        videoState,
      },
      timestamp: new Date(),
    }));
  }

  private async handleVideoUpdate(ws: ExtendedWebSocket, payload: VideoState) {
    if (!ws.roomId) return;

    const room = await storage.getRoom(ws.roomId);
    if (!room || room.hostId !== ws.userId) {
      console.log("Video update rejected: User is not room host");
      return;
    }

    this.videoStates.set(ws.roomId, {
      ...payload,
      timestamp: new Date(),
    });

    await this.broadcastToRoom(ws.roomId, {
      type: 'VIDEO_STATE_UPDATED',
      payload,
      timestamp: new Date(),
    });
  }

  private async leaveRoom(ws: ExtendedWebSocket) {
    if (!ws.roomId) return;

    console.log(`User ${ws.userId} leaving room ${ws.roomId}`);

    const roomParticipants = this.rooms.get(ws.roomId);
    if (roomParticipants) {
      roomParticipants.delete(ws);
      if (roomParticipants.size === 0) {
        this.rooms.delete(ws.roomId);
        this.videoStates.delete(ws.roomId);
        await storage.endRoom(ws.roomId);
        console.log(`Room ${ws.roomId} closed - no participants remaining`);
      } else {
        // If host left, assign new host
        const room = await storage.getRoom(ws.roomId);
        if (room && room.hostId === ws.userId) {
          const newHost = Array.from(roomParticipants)[0];
          if (newHost.userId) {
            await storage.updateRoom(ws.roomId, { hostId: newHost.userId });
            await this.broadcastToRoom(ws.roomId, {
              type: 'HOST_CHANGED',
              payload: { newHostId: newHost.userId },
              timestamp: new Date(),
            });
          }
        }
      }
    }

    // Broadcast leave event
    await this.broadcastToRoom(ws.roomId, {
      type: 'USER_LEFT',
      payload: { 
        userId: ws.userId,
        username: storage.getUser(ws.userId)?.username
      },
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

  public shutdown() {
    console.log("Shutting down WebSocket server...");
    clearInterval(this.heartbeatInterval);
    this.wss.close();
  }
}