import { useState, useCallback, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Heart,
  Trophy,
  Activity,
  MessageSquare,
  UserPlus,
  Search,
  Loader2,
  X,
  Check,
  ChevronLeft,
  Volume2,
  Zap
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ActiveFriends from "@/components/ActiveFriends";
import FriendActivity from "@/components/FriendActivity";
import FriendChallenges from "@/components/FriendChallenges";
import FriendsLeaderboard from "@/components/FriendsLeaderboard";
import CircleJerk from "@/components/CircleJerk";
import { Input } from "@/components/ui/input";


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
  const [friendUsername, setFriendUsername] = useState("");

  const { data: friends, isLoading: isLoadingFriends } = useQuery({
    queryKey: ["/api/friends"],
    refetchInterval: 30000,
  });

  const addFriendMutation = useMutation({
    mutationFn: async (username) => {
      const res = await apiRequest("POST", "/api/friends/request", { username });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Friend request sent!",
        description: "They'll be notified of your request.",
      });
      setFriendUsername("");
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to send friend request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddFriend = (e) => {
    e.preventDefault();
    if (friendUsername.trim()) {
      addFriendMutation.mutate(friendUsername.trim());
    }
  };

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


  if (isLoadingFriends) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-8">
            <Card className="mb-6 bg-black/20 border-purple-500/20 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <UserPlus className="h-5 w-5 text-purple-400" />
                  Add Friend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddFriend} className="flex gap-2">
                  <Input
                    placeholder="Enter username"
                    value={friendUsername}
                    onChange={(e) => setFriendUsername(e.target.value)}
                    className="bg-white/10 border-purple-500/20 text-white placeholder:text-white/50"
                  />
                  <Button
                    type="submit"
                    disabled={addFriendMutation.isPending || !friendUsername.trim()}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    {addFriendMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Add"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Tabs defaultValue="activity" className="w-full" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-4 h-14 bg-black/20 rounded-lg p-1">
                <TabsTrigger value="activity" className="data-[state=active]:bg-purple-500">
                  <Activity className="h-4 w-4 mr-2" />
                  Activity
                </TabsTrigger>
                <TabsTrigger value="circles" className="data-[state=active]:bg-purple-500">
                  <Users className="h-4 w-4 mr-2" />
                  Circles
                </TabsTrigger>
                <TabsTrigger value="challenges" className="data-[state=active]:bg-purple-500">
                  <Trophy className="h-4 w-4 mr-2" />
                  Challenges
                </TabsTrigger>
                <TabsTrigger value="leaderboard" className="data-[state=active]:bg-purple-500">
                  <Activity className="h-4 w-4 mr-2" />
                  Leaderboard
                </TabsTrigger>
              </TabsList>

              <TabsContent value="activity" className="mt-6">
                <FriendActivity onReaction={sendReactionMutation.mutate} />
              </TabsContent>

              <TabsContent value="circles" className="mt-6">
                <CircleJerk />
              </TabsContent>

              <TabsContent value="challenges" className="mt-6">
                <FriendChallenges />
              </TabsContent>

              <TabsContent value="leaderboard" className="mt-6">
                <FriendsLeaderboard />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Active Friends & Stats */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-black/20 border-purple-500/20 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="h-5 w-5 text-purple-400" />
                  Active Friends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ActiveFriends />
              </CardContent>
            </Card>

            <Card className="bg-black/20 border-purple-500/20 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Heart className="h-5 w-5 text-purple-400" />
                  Friend Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <p className="text-2xl font-bold text-purple-400">{friends?.length || 0}</p>
                    <p className="text-sm text-white/70">Total Friends</p>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <p className="text-2xl font-bold text-purple-400">
                      {friends?.filter(f => f.isOnline)?.length || 0}
                    </p>
                    <p className="text-sm text-white/70">Online Now</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}