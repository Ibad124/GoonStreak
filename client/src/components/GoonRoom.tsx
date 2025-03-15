import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { Timer, Users, MessageCircle, X, Send, Play, Pause, Settings, Crown } from "lucide-react";
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
  const [wsError, setWsError] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // WebSocket setup
  useEffect(() => {
    if (!isOpen || !user) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    console.log('Connecting to WebSocket:', wsUrl);

    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WebSocket connected");
      setWsError(null);
      toast({
        title: "Connected to room server",
        description: "Ready to start or join a session!",
        variant: "default",
      });
    };

    socket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        handleWebSocketMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setWsError("Failed to connect to room server");
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
      setRoom(null);
      setParticipants([]);
      setMessages([]);
      setTimerActive(false);
      setTimeElapsed(0);
    };
  }, [isOpen, user]);

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
        setIsHost(message.payload.room.hostId === user?.id);
        break;
      case "USER_JOINED":
        setParticipants(prev => [...prev, message.payload]);
        toast({
          title: "New participant joined!",
          description: `${message.payload.username} joined the room`,
          variant: "default",
        });
        break;
      case "USER_LEFT":
        setParticipants(prev => prev.filter(p => p.userId !== message.payload.userId));
        toast({
          description: `${message.payload.username} left the room`,
          variant: "default",
        });
        break;
      case "MESSAGE":
        setMessages(prev => [...prev, message.payload]);
        break;
      case "TIMER_STARTED":
        setTimerActive(true);
        setTimeElapsed(message.payload.elapsedTime || 0);
        toast({
          description: "Session timer started",
          variant: "default",
        });
        break;
      case "TIMER_STOPPED":
        setTimerActive(false);
        toast({
          description: "Session timer paused",
          variant: "default",
        });
        break;
      case "HOST_CHANGED":
        setIsHost(message.payload.newHostId === user?.id);
        if (message.payload.newHostId === user?.id) {
          toast({
            title: "You're now the host!",
            description: "You can control the session timer",
            variant: "default",
          });
        }
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
    if (!ws || !room || !isHost) return;

    ws.send(JSON.stringify({
      type: timerActive ? "TIMER_STOP" : "TIMER_START",
      roomId: room.id,
      payload: {
        elapsedTime: timeElapsed,
      },
      timestamp: new Date(),
    }));
  }, [ws, room, timerActive, timeElapsed, isHost]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-4xl"
          >
            <Card className={`${themeStyles.cardBg} backdrop-blur shadow-2xl`}>
              <CardHeader className="flex flex-row items-center justify-between border-b">
                <CardTitle className={`text-2xl font-bold ${themeStyles.text} flex items-center gap-2`}>
                  {room?.name || "Live Training Room"}
                  {isHost && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1 text-sm font-normal bg-primary/10 px-2 py-1 rounded-full"
                    >
                      <Crown className="h-4 w-4 text-primary" />
                      Host
                    </motion.div>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {isHost && (
                    <Button
                      variant="outline"
                      size="icon"
                      className={`rounded-full ${themeStyles.text}`}
                    >
                      <Settings className="h-5 w-5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className={`rounded-full ${themeStyles.text}`}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                {wsError ? (
                  <div className="col-span-3 text-center p-6">
                    <p className={`${themeStyles.text} text-lg mb-4`}>{wsError}</p>
                    <Button
                      onClick={() => window.location.reload()}
                      className={`bg-gradient-to-br ${themeStyles.button} text-white`}
                    >
                      Retry Connection
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Timer and Controls */}
                    <div className="space-y-4">
                      <motion.div
                        className={`text-4xl font-mono text-center ${themeStyles.text} p-6 rounded-lg border bg-black/5`}
                        animate={{
                          scale: timerActive ? [1, 1.05, 1] : 1,
                        }}
                        transition={{
                          duration: 1,
                          repeat: timerActive ? Infinity : 0,
                          repeatType: "reverse"
                        }}
                      >
                        {formatTime(timeElapsed)}
                      </motion.div>
                      <div className="flex justify-center gap-2">
                        <Button
                          className={`
                            bg-gradient-to-br ${themeStyles.button} text-white
                            ${!isHost && 'opacity-50 cursor-not-allowed'}
                          `}
                          onClick={toggleTimer}
                          disabled={!isHost}
                        >
                          {timerActive ? (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Start
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Participants */}
                    <div className={`${themeStyles.text} space-y-2`}>
                      <div className="flex items-center gap-2 mb-4">
                        <Users className="h-5 w-5" />
                        <h3 className="font-semibold">Participants ({participants.length})</h3>
                      </div>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {participants.map((participant, i) => (
                          <motion.div
                            key={participant.userId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-2 p-2 rounded-lg bg-black/5"
                          >
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="font-medium">{participant.username}</span>
                            {participant.userId === room?.hostId && (
                              <Crown className="h-4 w-4 text-yellow-500" />
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Chat */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-4">
                        <MessageCircle className={`h-5 w-5 ${themeStyles.text}`} />
                        <h3 className={`font-semibold ${themeStyles.text}`}>Chat</h3>
                      </div>
                      <div className="h-[300px] overflow-y-auto space-y-2 mb-2">
                        {messages.map((message, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`
                              ${themeStyles.text} text-sm p-2 rounded-lg
                              ${message.userId === user?.id ? 'bg-primary/10 ml-4' : 'bg-black/5 mr-4'}
                            `}
                          >
                            <span className="font-semibold">
                              {participants.find(p => p.userId === message.userId)?.username || 'Unknown'}:
                            </span>
                            <span className="ml-2">{message.content}</span>
                          </motion.div>
                        ))}
                        <div ref={messagesEndRef} />
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
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}