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
    this.wss = new WebSocketServer({ server, path: "/ws" });
    this.setupWebSocketServer();
    this.heartbeatInterval = setInterval(() => this.checkConnections(), 30000);
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocket) => {
      const extWs = ws as ExtendedWebSocket;
      extWs.isAlive = true;

      extWs.on('pong', () => {
        extWs.isAlive = true;
      });

      extWs.on('message', async (data: string) => {
        try {
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
        if (extWs.roomId) {
          this.leaveRoom(extWs);
        }
      });
    });
  }

  private async handleEvent(ws: ExtendedWebSocket, event: RoomEvent) {
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

    const roomParticipants = this.rooms.get(ws.roomId);
    if (roomParticipants) {
      roomParticipants.delete(ws);
      if (roomParticipants.size === 0) {
        this.rooms.delete(ws.roomId);
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
    clearInterval(this.heartbeatInterval);
    this.wss.close();
  }
}