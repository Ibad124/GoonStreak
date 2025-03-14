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
  Trophy,
  MessageSquare,
  Timer,
  Sparkles,
  Target,
  Loader2
} from "lucide-react";
import FriendsList from "@/components/FriendsList";
import FriendActivity from "@/components/FriendActivity";
import SocialAchievements from "@/components/SocialAchievements";
import SocialChallenges from "@/components/SocialChallenges";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { GoonRoom } from "@/components/GoonRoom";
import { TooltipGuide } from "@/components/TooltipGuide";

const themeStyles = {
  default: {
    background: "bg-gradient-to-br from-zinc-50 to-blue-50",
    cardBg: "bg-white/80",
    text: "text-zinc-900",
    border: "border-zinc-200/50",
    accent: "text-blue-500",
    button: "from-blue-500 to-blue-600"
  },
  solo: {
    background: "bg-gradient-to-br from-slate-900 to-zinc-900",
    cardBg: "bg-black/20",
    text: "text-zinc-100",
    border: "border-white/10",
    accent: "text-emerald-500",
    button: "from-emerald-500 to-emerald-600"
  },
  competitive: {
    background: "bg-gradient-to-br from-purple-900 to-pink-900",
    cardBg: "bg-black/20",
    text: "text-pink-100",
    border: "border-white/10",
    accent: "text-pink-500",
    button: "from-pink-500 to-purple-500"
  },
  hardcore: {
    background: "bg-gradient-to-br from-red-950 to-black",
    cardBg: "bg-black/20",
    text: "text-red-100",
    border: "border-white/10",
    accent: "text-red-500",
    button: "from-red-500 to-red-600"
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

export default function SocialPage() {
  const { user } = useAuth();
  const { preferences } = useTheme();
  const { toast } = useToast();
  const [isGoonRoomOpen, setIsGoonRoomOpen] = useState(false);
  const style = themeStyles[preferences?.goonStyle || "default"];
  const [activeTab, setActiveTab] = useState("activity");

  const { data: activeRooms = [], isLoading: isLoadingRooms } = useQuery({
    queryKey: ["/api/rooms/active"],
    refetchInterval: 5000,
  });

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${style.background}`}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <h1 className={`text-2xl font-bold mb-4 ${style.text}`}>Please log in to continue</h1>
          <Link href="/auth">
            <Button className={`bg-gradient-to-br ${style.button}`}>
              Login
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const handleJoinRoom = (roomId) => {
    setIsGoonRoomOpen(true);
    toast({
      title: "Joining session...",
      description: "Connecting to the room server",
    });
  };

  return (
    <>
      <div className={`min-h-screen ${style.background}`}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwbDIwLTIwTTAgNDBsMjAtMjBNMTAgNTBsMjAtMjAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIiBzdHJva2Utd2lkdGg9IjIiLz48L3BhdHRlcm4+PC9kZWZzPjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik0wIDBoMjAwdjIwMEgweiIvPjwvc3ZnPg==')]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className={`fixed top-0 left-0 right-0 ${style.cardBg} backdrop-blur z-50 border-b ${style.border}`}
        >
          <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <Link href="/">
                <Button variant="ghost" size="icon" className={`rounded-full ${style.text} hover:${style.accent}`}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </Link>
              <motion.h1
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className={`text-lg md:text-xl font-semibold ${style.text} truncate`}
              >
                Social Hub
              </motion.h1>
            </div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0"
            >
              <TooltipGuide
                id="create-room"
                title="Create Your First Room"
                description="Ready to start? Create a training room and invite your friends to join!"
                position="bottom"
                step={5}
                totalSteps={5}
              >
                <Button
                  onClick={() => setIsGoonRoomOpen(true)}
                  className={`rounded-full bg-gradient-to-br ${style.button} shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  <Video className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Create Room</span>
                </Button>
              </TooltipGuide>
            </motion.div>
          </div>
        </motion.header>

        <main className="container mx-auto px-4 pt-24 pb-32">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6"
          >
            <motion.div variants={itemVariants} className="space-y-4 md:space-y-6">
              <TooltipGuide
                id="friends-list"
                title="Welcome to Social Hub!"
                description="Start by connecting with like-minded individuals. Add friends and build your support network."
                position="right"
                step={1}
                totalSteps={5}
              >
                <Card className={`${style.cardBg} backdrop-blur ${style.border} transition-all duration-300 hover:shadow-lg`}>
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className={`${style.text} text-lg md:text-xl`}>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-between"
                      >
                        <span>Friends</span>
                      </motion.div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                    <FriendsList />
                  </CardContent>
                </Card>
              </TooltipGuide>
            </motion.div>

            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4 md:space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 w-full">
                  <TooltipGuide
                    id="activity-feed"
                    title="Activity Feed"
                    description="Keep track of your friends' progress and achievements in real-time!"
                    position="bottom"
                    step={2}
                    totalSteps={5}
                  >
                    <TabsTrigger value="activity" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="hidden md:inline">Activity</span>
                    </TabsTrigger>
                  </TooltipGuide>

                  <TooltipGuide
                    id="live-rooms"
                    title="Live Training Sessions"
                    description="Train together in real-time! Join or create training rooms to stay motivated."
                    position="bottom"
                    step={3}
                    totalSteps={5}
                  >
                    <TabsTrigger value="rooms" className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      <span className="hidden md:inline">Rooms</span>
                    </TabsTrigger>
                  </TooltipGuide>

                  <TooltipGuide
                    id="group-challenges"
                    title="Group Challenges"
                    description="Push your limits together! Join group challenges and compete with friends."
                    position="bottom"
                    step={4}
                    totalSteps={5}
                  >
                    <TabsTrigger value="challenges" className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <span className="hidden md:inline">Challenges</span>
                    </TabsTrigger>
                  </TooltipGuide>

                  <TooltipGuide
                    id="achievements"
                    title="Social Achievements"
                    description="Unlock special achievements by participating in group activities!"
                    position="bottom"
                    step={5}
                    totalSteps={5}
                  >
                    <TabsTrigger value="achievements" className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      <span className="hidden md:inline">Achievements</span>
                    </TabsTrigger>
                  </TooltipGuide>
                </TabsList>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 md:mt-6"
                  >
                    <TabsContent value="activity">
                      <Card className={`${style.cardBg} backdrop-blur ${style.border} transition-all duration-300 hover:shadow-lg`}>
                        <CardHeader>
                          <CardTitle className={`${style.text}`}>Friend Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <FriendActivity />
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="rooms">
                      <Card className={`${style.cardBg} backdrop-blur ${style.border} transition-all duration-300 hover:shadow-lg`}>
                        <CardHeader>
                          <CardTitle className={`${style.text}`}>Active Sessions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {isLoadingRooms ? (
                            <div className="text-center py-8">
                              <Loader2 className={`h-8 w-8 animate-spin mx-auto mb-4 ${style.accent}`} />
                              <p className={`${style.text}`}>Loading active sessions...</p>
                            </div>
                          ) : activeRooms.length > 0 ? (
                            <motion.div
                              variants={containerVariants}
                              initial="hidden"
                              animate="visible"
                              className="grid gap-4 md:gap-6"
                            >
                              {activeRooms.map((room) => (
                                <motion.div
                                  key={room.id}
                                  variants={itemVariants}
                                  className={`p-4 md:p-6 rounded-lg border ${style.border} ${style.cardBg} hover:shadow-lg transition-all duration-300`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h3 className={`font-semibold ${style.text}`}>{room.name}</h3>
                                      <p className={`text-sm opacity-80 ${style.text}`}>
                                        {room.participants} participants • {room.duration}
                                      </p>
                                    </div>
                                    <motion.div
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <Button
                                        onClick={() => handleJoinRoom(room.id)}
                                        className={`rounded-full bg-gradient-to-br ${style.button} shadow-md hover:shadow-lg transition-all duration-300`}
                                      >
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Join Session
                                      </Button>
                                    </motion.div>
                                  </div>
                                </motion.div>
                              ))}
                            </motion.div>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-center py-8"
                            >
                              <Video className={`h-12 w-12 mx-auto mb-4 ${style.accent} opacity-50`} />
                              <p className={`${style.text}`}>No active sessions</p>
                              <p className={`text-sm mt-2 opacity-80 ${style.text}`}>
                                Start a session to connect with others!
                              </p>
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="challenges">
                      <Card className={`${style.cardBg} backdrop-blur ${style.border} transition-all duration-300 hover:shadow-lg`}>
                        <CardHeader>
                          <CardTitle className={`${style.text}`}>Group Challenges</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <SocialChallenges />
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="achievements">
                      <Card className={`${style.cardBg} backdrop-blur ${style.border} transition-all duration-300 hover:shadow-lg`}>
                        <CardHeader>
                          <CardTitle className={`${style.text}`}>Social Achievements</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <SocialAchievements />
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </motion.div>
                </AnimatePresence>
              </Tabs>
            </motion.div>
          </motion.div>
        </main>

        <GoonRoom
          isOpen={isGoonRoomOpen}
          onClose={() => setIsGoonRoomOpen(false)}
        />

        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            className={`fixed bottom-6 right-6 h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg bg-gradient-to-br ${style.button} hover:shadow-xl transition-all duration-300`}
            size="icon"
          >
            <MessageSquare className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
        </motion.div>
      </div>
    </>
  );
}