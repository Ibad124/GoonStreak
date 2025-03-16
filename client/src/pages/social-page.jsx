import { useState, useEffect, Suspense, useCallback } from "react";
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

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
    >
      <Loader2 className="w-8 h-8 text-purple-400" />
    </motion.div>
  </div>
);

export default function SocialPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("activity");
  const [showConfetti, setShowConfetti] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const { data: friends, isLoading: isLoadingFriends } = useQuery({
    queryKey: ["/api/friends"],
    refetchInterval: 30000,
  });

  const sendHype = useCallback(async (friendId) => {
    const res = await apiRequest("POST", `/api/friends/${friendId}/hype`);
    if (voiceEnabled) {
      const msg = new SpeechSynthesisUtterance("Nice job! Keep going!");
      window.speechSynthesis.speak(msg);
    }
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
    return res.json();
  }, [voiceEnabled]);

  const sendHypeMutation = useMutation({
    mutationFn: sendHype,
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
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-pink-900">
      {/* Confetti Animation */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50"
          >
            <Lottie
              animationData={confettiAnimation}
              loop={false}
              style={{ width: "100%", height: "100%" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwbDIwLTIwTTAgNDBsMjAtMjBNMTAgNTBsMjAtMjAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIiBzdHJva2Utd2lkdGg9IjIiLz48L3BhdHRlcm4+PC9kZWZzPjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik0wIDBoMjAwdjIwMEgweiIvPjwvc3ZnPg==')]" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
        />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-black/40 backdrop-blur z-50 border-b border-white/10">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-white hover:text-purple-400 transition-colors duration-200"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-white">Social Hub</h1>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`rounded-full transition-colors duration-200 ${
                voiceEnabled ? 'text-green-400 bg-green-400/10' : 'text-white/50 hover:text-white/80'
              }`}
            >
              <Volume2 className="h-5 w-5" />
            </Button>

            <Button
              onClick={() => toast({
                title: "Coming Soon!",
                description: "Group sessions will be available soon.",
              })}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 gap-2 rounded-full px-6"
            >
              <Plus className="h-4 w-4" />
              Create Session
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 pt-24 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="bg-black/20 border-white/10 backdrop-blur">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-400" />
                  Friends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<LoadingSpinner />}>
                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {friends?.map((friend) => (
                        <motion.div
                          key={friend.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="p-4 bg-black/20 rounded-xl border border-white/10 hover:bg-black/30 transition-all duration-300"
                        >
                          <div className="flex items-center gap-4">
                            <UserAvatar2D level={friend.level} mood={friend.mood} />
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-bold truncate">{friend.username}</h3>
                              <p className="text-purple-400 text-sm">Level {friend.level}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="h-8 w-8 rounded-full bg-purple-500/20 hover:bg-purple-500/40 flex items-center justify-center transition-colors duration-200"
                                onClick={() => sendHypeMutation.mutate(friend.id)}
                              >
                                <Zap className="h-4 w-4 text-purple-400" />
                              </motion.button>
                              <div className="flex gap-1 justify-center">
                                {["🔥", "💦", "🤣", "👀"].map((reaction) => (
                                  <motion.button
                                    key={reaction}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.8 }}
                                    className="text-lg hover:transform hover:translateY(-2px) transition-transform duration-200"
                                    onClick={() => sendReactionMutation.mutate({ friendId: friend.id, reaction })}
                                  >
                                    {reaction}
                                  </motion.button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </Suspense>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-8 space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 gap-4 bg-black/20 p-1.5 rounded-2xl">
                {[
                  { value: "activity", icon: Target, label: "Activity" },
                  { value: "achievements", icon: Trophy, label: "Achievements" },
                  { value: "leaderboard", icon: Crown, label: "Leaderboard" },
                  { value: "clans", icon: Users, label: "Clans" }
                ].map(({ value, icon: Icon, label }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-xl py-3 transition-all duration-300"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="mt-8">
                <AnimatePresence mode="wait">
                  {["activity", "achievements", "leaderboard", "clans"].map((tab) => (
                    <TabsContent key={tab} value={tab}>
                      <Suspense fallback={<LoadingSpinner />}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card className="bg-black/20 border-white/10 backdrop-blur">
                            <CardHeader>
                              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                                {tab === "activity" && <Target className="h-5 w-5 text-purple-400" />}
                                {tab === "achievements" && <Trophy className="h-5 w-5 text-purple-400" />}
                                {tab === "leaderboard" && <Crown className="h-5 w-5 text-purple-400" />}
                                {tab === "clans" && <Users className="h-5 w-5 text-purple-400" />}
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              {tab === "activity" && <FriendActivity onReaction={sendReactionMutation.mutate} />}
                              {tab === "achievements" && <SocialAchievements />}
                              {tab === "leaderboard" && <FriendsLeaderboard />}
                              {tab === "clans" && <GoonClans />}
                            </CardContent>
                          </Card>
                        </motion.div>
                      </Suspense>
                    </TabsContent>
                  ))}
                </AnimatePresence>
              </div>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          onClick={() => toast({
            title: "Coming Soon!",
            description: "Chat features will be available soon.",
          })}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:shadow-xl transition-all duration-300"
          size="icon"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </motion.div>
    </div>
  );
}