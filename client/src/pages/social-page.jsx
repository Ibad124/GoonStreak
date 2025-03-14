import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  Video, 
  Users,
  UserPlus,
  Settings,
  MessageSquare,
  Trophy,
  Share2,
  Image,
  UserCheck,
  Search,
  Timer,
  Sparkles
} from "lucide-react";
import FriendsList from "@/components/FriendsList";
import FriendActivity from "@/components/FriendActivity";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { GoonRoom } from "@/components/GoonRoom";

const themeStyles = {
  default: {
    background: "bg-gradient-to-br from-zinc-50 to-blue-50",
    cardBg: "bg-white/80",
    text: "text-zinc-900",
    border: "border-zinc-200/50"
  },
  solo: {
    background: "bg-gradient-to-br from-slate-900 to-zinc-900",
    cardBg: "bg-black/20",
    text: "text-zinc-100",
    border: "border-white/10"
  },
  competitive: {
    background: "bg-gradient-to-br from-purple-900 to-pink-900",
    cardBg: "bg-black/20",
    text: "text-pink-100",
    border: "border-white/10"
  },
  hardcore: {
    background: "bg-gradient-to-br from-red-950 to-black",
    cardBg: "bg-black/20",
    text: "text-red-100",
    border: "border-white/10"
  }
};

export default function SocialPage() {
  const { user } = useAuth();
  const { preferences } = useTheme();
  const { toast } = useToast();
  const [isGoonRoomOpen, setIsGoonRoomOpen] = useState(false);
  const style = themeStyles[preferences?.goonStyle || "default"];

  const { data: activeRooms = [], isLoading: isLoadingRooms } = useQuery({
    queryKey: ["/api/rooms/active"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to continue</h1>
          <Link href="/auth">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${style.background}`}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 ${style.cardBg} backdrop-blur z-50 border-b ${style.border}`}>
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className={`text-xl font-semibold ${style.text}`}>Social Hub</h1>
          </div>
          <Button 
            onClick={() => setIsGoonRoomOpen(true)}
            className="rounded-full"
          >
            <Video className="h-4 w-4 mr-2" />
            Create Room
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Friends and Activity */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={`${style.cardBg} backdrop-blur ${style.border}`}>
                <CardHeader>
                  <CardTitle className={`flex items-center justify-between ${style.text}`}>
                    <span>Friends</span>
                    <Button variant="ghost" size="icon">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FriendsList />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Center and Right Columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Rooms Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={`${style.cardBg} backdrop-blur ${style.border}`}>
                <CardHeader>
                  <CardTitle className={`${style.text}`}>Active Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingRooms ? (
                    <div className="text-center py-8">
                      <Timer className="h-8 w-8 animate-spin mx-auto mb-4" />
                      <p className={`${style.text}`}>Loading active sessions...</p>
                    </div>
                  ) : activeRooms.length > 0 ? (
                    <div className="grid gap-4">
                      {activeRooms.map((room) => (
                        <motion.div
                          key={room.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`p-4 rounded-lg border ${style.border} ${style.cardBg}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className={`font-semibold ${style.text}`}>{room.name}</h3>
                              <p className={`text-sm opacity-80 ${style.text}`}>
                                {room.participants} participants • {room.duration}
                              </p>
                            </div>
                            <Button 
                              onClick={() => setIsGoonRoomOpen(true)}
                              className="rounded-full"
                            >
                              <Sparkles className="h-4 w-4 mr-2" />
                              Join Session
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className={`${style.text}`}>No active sessions</p>
                      <p className={`text-sm mt-2 opacity-80 ${style.text}`}>
                        Start a session to connect with others!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Activity Feed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className={`${style.cardBg} backdrop-blur ${style.border}`}>
                <CardHeader>
                  <CardTitle className={`${style.text}`}>Friend Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <FriendActivity />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Goon Room Modal */}
      <GoonRoom
        isOpen={isGoonRoomOpen}
        onClose={() => setIsGoonRoomOpen(false)}
      />

      {/* Chat Button */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 transform hover:scale-110"
        size="icon"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    </div>
  );
}