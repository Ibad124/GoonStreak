import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { Timer, Users, MessageCircle, X, Send, Play, Pause } from "lucide-react";
import type { Room, RoomParticipant, RoomMessage } from "@shared/schema";

interface GoonRoomProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WebSocketMessage {
  type: string;
  roomId: number;
  payload: any;
  timestamp: Date;
}

export function GoonRoom({ isOpen, onClose }: GoonRoomProps) {
  const { preferences } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [timerActive, setTimerActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [messageInput, setMessageInput] = useState("");

  const style = preferences.goonStyle || "default";

  const themeStyles = {
    default: {
      background: "from-zinc-50 to-blue-50",
      cardBg: "bg-white/80",
      text: "text-zinc-900",
      accent: "text-blue-500",
      button: "from-blue-500 to-blue-600",
    },
    solo: {
      background: "from-slate-900 to-zinc-900",
      cardBg: "bg-black/50",
      text: "text-zinc-100",
      accent: "text-emerald-500",
      button: "from-emerald-500 to-emerald-600",
    },
    competitive: {
      background: "from-purple-900 to-pink-900",
      cardBg: "bg-black/50",
      text: "text-pink-100",
      accent: "text-pink-500",
      button: "from-pink-500 to-purple-500",
    },
    hardcore: {
      background: "from-red-950 to-black",
      cardBg: "bg-black/50",
      text: "text-red-100",
      accent: "text-red-500",
      button: "from-red-500 to-red-600",
    },
  }[style];

  // WebSocket setup
  useEffect(() => {
    if (!isOpen) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WebSocket connected");
      toast({
        title: "Connected to room server",
        description: "Ready to start or join a session!",
      });
    };

    socket.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data);
      handleWebSocketMessage(message);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to room server",
        variant: "destructive",
      });
    };

    setWs(socket);

    return () => {
      socket.close();
      setWs(null);
    };
  }, [isOpen]);

  // Timer logic
  useEffect(() => {
    if (!timerActive) return;

    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive]);

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case "ROOM_STATE":
        setRoom(message.payload.room);
        setParticipants(message.payload.participants);
        break;
      case "USER_JOINED":
      case "USER_LEFT":
        setParticipants(prev => 
          message.type === "USER_JOINED" 
            ? [...prev, message.payload]
            : prev.filter(p => p.userId !== message.payload.userId)
        );
        break;
      case "MESSAGE":
        setMessages(prev => [...prev, message.payload]);
        break;
      case "TIMER_STARTED":
        setTimerActive(true);
        break;
      case "TIMER_STOPPED":
        setTimerActive(false);
        break;
    }
  };

  const sendMessage = useCallback(() => {
    if (!ws || !messageInput.trim() || !room) return;

    ws.send(JSON.stringify({
      type: "SEND_MESSAGE",
      roomId: room.id,
      payload: {
        content: messageInput,
        type: "text",
      },
      timestamp: new Date(),
    }));

    setMessageInput("");
  }, [ws, messageInput, room]);

  const toggleTimer = useCallback(() => {
    if (!ws || !room) return;

    ws.send(JSON.stringify({
      type: timerActive ? "TIMER_STOP" : "TIMER_START",
      roomId: room.id,
      payload: {},
      timestamp: new Date(),
    }));
  }, [ws, room, timerActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <Card className={`w-full max-w-4xl ${themeStyles.cardBg} backdrop-blur`}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className={`text-2xl font-bold ${themeStyles.text}`}>
                Live Goon Room
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className={themeStyles.text}
              >
                <X className="h-6 w-6" />
              </Button>
            </CardHeader>

            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Timer and Controls */}
              <div className="space-y-4">
                <div className={`text-4xl font-mono text-center ${themeStyles.text}`}>
                  {formatTime(timeElapsed)}
                </div>
                <div className="flex justify-center gap-2">
                  <Button
                    className={`bg-gradient-to-br ${themeStyles.button} text-white`}
                    onClick={toggleTimer}
                  >
                    {timerActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                    {timerActive ? "Pause" : "Start"}
                  </Button>
                </div>
              </div>

              {/* Participants */}
              <div className={`${themeStyles.text} space-y-2`}>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <h3 className="font-semibold">Participants</h3>
                </div>
                <div className="space-y-1">
                  {participants.map((participant, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>User {participant.userId}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className={`h-5 w-5 ${themeStyles.text}`} />
                  <h3 className={`font-semibold ${themeStyles.text}`}>Chat</h3>
                </div>
                <div className="h-[200px] overflow-y-auto space-y-2 mb-2">
                  {messages.map((message, i) => (
                    <div key={i} className={`${themeStyles.text} text-sm`}>
                      <span className="font-semibold">User {message.userId}:</span>
                      <span className="ml-2">{message.content}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button
                    onClick={sendMessage}
                    className={`bg-gradient-to-br ${themeStyles.button} text-white`}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
