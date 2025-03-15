import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Lock, Users, Video, Plus, Crown, AlertTriangle } from "lucide-react";

interface GoonRoom {
  id: number;
  name: string;
  hostId: number;
  hostName: string;
  isPrivate: boolean;
  participantCount: number;
  currentVideo?: string;
  createdAt: Date;
}

export function GoonHub() {
  const { preferences } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedVideo, setSelectedVideo] = useState("");

  const style = preferences?.goonStyle || "default";

  // Fetch available videos with error handling
  const { data: videos = [], isError: isVideosError } = useQuery({
    queryKey: ["/api/content/videos"],
    retry: false,
  });

  // Fetch active rooms with error handling
  const { data: rooms = [], isError: isRoomsError } = useQuery<GoonRoom[]>({
    queryKey: ["/api/rooms/active"],
    refetchInterval: 5000,
    retry: false,
  });

  const createRoomMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/rooms", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms/active"] });
      setIsCreateRoomOpen(false);
      toast({
        title: "Room Created!",
        description: "Your goon room is ready.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Error UI Components
  if (isVideosError || isRoomsError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Unable to Load Content</h3>
        <p className="text-muted-foreground mb-4">
          There was an error loading the content. Please try again later.
        </p>
        <Button 
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/content/videos"] });
            queryClient.invalidateQueries({ queryKey: ["/api/rooms/active"] });
          }}
          variant="outline"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Room Button */}
      <div className="flex justify-end">
        <Dialog open={isCreateRoomOpen} onOpenChange={setIsCreateRoomOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-br from-primary to-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Room
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a Goon Room</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Room Name</label>
                <Input
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Enter room name..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Video</label>
                <select
                  value={selectedVideo}
                  onChange={(e) => setSelectedVideo(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="">Select a video...</option>
                  {videos.map((video: any) => (
                    <option key={video.id} value={video.url}>
                      {video.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={isPrivate ? "default" : "outline"}
                  onClick={() => setIsPrivate(true)}
                  className="flex-1"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Private
                </Button>
                <Button
                  type="button"
                  variant={!isPrivate ? "default" : "outline"}
                  onClick={() => setIsPrivate(false)}
                  className="flex-1"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Public
                </Button>
              </div>

              {isPrivate && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter room password..."
                  />
                </div>
              )}

              <Button
                className="w-full"
                onClick={() => {
                  if (!roomName.trim() || !selectedVideo) {
                    toast({
                      title: "Error",
                      description: "Please provide a room name and select a video.",
                      variant: "destructive",
                    });
                    return;
                  }

                  createRoomMutation.mutate({
                    name: roomName,
                    isPrivate,
                    password: isPrivate ? password : undefined,
                    hostId: user?.id,
                    videoUrl: selectedVideo,
                  });
                }}
                disabled={!roomName.trim() || !selectedVideo || createRoomMutation.isPending}
              >
                {createRoomMutation.isPending ? "Creating..." : "Create Room"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {rooms.map((room) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative group"
            >
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {room.name}
                      {room.isPrivate && (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {room.participantCount} / 10
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4" />
                        <span>Hosted by {room.hostName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        <span>Video Playing</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => {
                          toast({
                            title: "Coming Soon",
                            description: "Live video rooms are currently under development.",
                            variant: "default",
                          });
                        }}
                        disabled={room.participantCount >= 10}
                      >
                        Join Room (Coming Soon)
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {rooms.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full text-center py-12"
          >
            <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Active Rooms</h3>
            <p className="text-muted-foreground">
              Create a room to start watching with friends!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}