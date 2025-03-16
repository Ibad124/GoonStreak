import { useState, useEffect, Suspense } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import confettiAnimation from "@/animations/confetti.json";
import {
  ChevronLeft,
  Users,
  Trophy,
  Target,
  MessageSquare,
  Star,
  Crown,
  Plus,
  Sparkles,
  Volume2,
  Zap,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FriendsList from "@/components/FriendsList";
import FriendActivity from "@/components/FriendActivity";
import SocialAchievements from "@/components/SocialAchievements";
import FriendsLeaderboard from "@/components/FriendsLeaderboard";
import UserAvatar2D from "@/components/UserAvatar2D";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GoonClans from "@/components/GoonClans";

export default function SocialPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("activity");
  const [showConfetti, setShowConfetti] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const { data: friends, isLoading: isLoadingFriends } = useQuery({
    queryKey: ["/api/friends"],
    refetchInterval: 30000, // Reduced polling frequency
  });

  const sendHypeMutation = useMutation({
    mutationFn: async (friendId) => {
      const res = await apiRequest("POST", `/api/friends/${friendId}/hype`);
      return res.json();
    },
    onSuccess: () => {
      if (voiceEnabled) {
        const msg = new SpeechSynthesisUtterance("Nice job! Keep going!");
        window.speechSynthesis.speak(msg);
      }
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    },
  });

  const sendReactionMutation = useMutation({
    mutationFn: async ({ friendId, reaction }) => {
      const res = await apiRequest("POST", `/api/friends/${friendId}/reaction`, { reaction });
      return res.json();
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-slate-900 to-pink-900">
        <Link href="/auth">
          <Button className="bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            Login to Continue
          </Button>
        </Link>
      </div>
    );
  }

  if (isLoadingFriends) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-slate-900 to-pink-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-purple-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-pink-900">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <Lottie
            animationData={confettiAnimation}
            loop={false}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwbDIwLTIwTTAgNDBsMjAtMjBNMTAgNTBsMjAtMjAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIiBzdHJva2Utd2lkdGg9IjIiLz48L3BhdHRlcm4+PC9kZWZzPjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik0wIDBoMjAwdjIwMEgweiIvPjwvc3ZnPg==')]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-black/40 backdrop-blur z-50 border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full text-white hover:text-purple-400">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-lg md:text-xl font-semibold text-white">
              Social Hub
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`rounded-full ${voiceEnabled ? 'text-green-400' : 'text-white/50'}`}
            >
              <Volume2 className="h-5 w-5" />
            </Button>

            <Button
              onClick={() => toast({
                title: "Coming Soon!",
                description: "Group sessions will be available soon.",
              })}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Session
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-black/20 border-white/10 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-400" />
                  Friends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading friends...</div>}>
                  <div className="space-y-4">
                    {friends?.map((friend) => (
                      <motion.div
                        key={friend.id}
                        layout
                        className="p-4 bg-black/20 rounded-lg border border-white/10"
                      >
                        <div className="flex items-center gap-4">
                          <UserAvatar2D level={friend.level} mood={friend.mood} />
                          <div className="flex-1">
                            <h3 className="text-white font-medium">{friend.username}</h3>
                            <p className="text-gray-400 text-sm">Level {friend.level}</p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-purple-500/20 hover:bg-purple-500/40"
                              onClick={() => sendHypeMutation.mutate(friend.id)}
                            >
                              <Zap className="h-4 w-4 text-purple-400" />
                            </Button>
                            <div className="flex gap-1">
                              {["🔥", "💦", "🤣", "👀"].map((reaction) => (
                                <button
                                  key={reaction}
                                  className="text-xs hover:scale-125 transition-transform"
                                  onClick={() => sendReactionMutation.mutate({ friendId: friend.id, reaction })}
                                >
                                  {reaction}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Suspense>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-8 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 gap-4 bg-black/20 p-1 rounded-xl">
                <TabsTrigger
                  value="activity"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg transition-all duration-200"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Activity
                </TabsTrigger>
                <TabsTrigger
                  value="achievements"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg transition-all duration-200"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Achievements
                </TabsTrigger>
                <TabsTrigger
                  value="leaderboard"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg transition-all duration-200"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Leaderboard
                </TabsTrigger>
                <TabsTrigger
                  value="clans"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg transition-all duration-200"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Clans
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="activity">
                  <Suspense fallback={<div>Loading activity...</div>}>
                    <Card className="bg-black/20 border-white/10 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Target className="h-5 w-5 text-purple-400" />
                          Friend Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <FriendActivity onReaction={sendReactionMutation.mutate} />
                      </CardContent>
                    </Card>
                  </Suspense>
                </TabsContent>

                <TabsContent value="achievements">
                  <Suspense fallback={<div>Loading achievements...</div>}>
                    <Card className="bg-black/20 border-white/10 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Star className="h-5 w-5 text-purple-400" />
                          Social Achievements
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <SocialAchievements />
                      </CardContent>
                    </Card>
                  </Suspense>
                </TabsContent>

                <TabsContent value="leaderboard">
                  <Suspense fallback={<div>Loading leaderboard...</div>}>
                    <Card className="bg-black/20 border-white/10 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Crown className="h-5 w-5 text-purple-400" />
                          Global Leaderboard
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <FriendsLeaderboard />
                      </CardContent>
                    </Card>
                  </Suspense>
                </TabsContent>

                <TabsContent value="clans">
                  <Suspense fallback={<div>Loading clans...</div>}>
                    <Card className="bg-black/20 border-white/10 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Users className="h-5 w-5 text-purple-400" />
                          Goon Clans
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <GoonClans />
                      </CardContent>
                    </Card>
                  </Suspense>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <Button
        onClick={() => toast({
          title: "Coming Soon!",
          description: "Chat features will be available soon.",
        })}
        className="fixed bottom-6 right-6 h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:shadow-xl transition-all duration-300"
        size="icon"
      >
        <MessageSquare className="h-5 w-5 md:h-6 md:w-6" />
      </Button>
    </div>
  );
}