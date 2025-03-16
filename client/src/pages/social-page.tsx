import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Activity,
  Trophy,
  Target,
  Plus,
  Circle,
  Crown,
  MessageCircle,
} from "lucide-react";
import FriendActivity from "@/components/FriendActivity";
import FriendChallenges from "@/components/FriendChallenges";
import ActiveFriends from "@/components/ActiveFriends";
import FriendsLeaderboard from "@/components/FriendsLeaderboard";

interface Circle {
  id: number;
  name: string;
  memberCount: number;
  isOwner: boolean;
  activeChallenge?: {
    title: string;
    progress: number;
  };
}

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState("activity");
  const [isCreateCircleOpen, setIsCreateCircleOpen] = useState(false);
  const { toast } = useToast();

  const { data: circles } = useQuery<Circle[]>({
    queryKey: ["/api/circles"],
  });

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-purple-900 via-slate-900 to-pink-900">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 pt-24"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-8 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 gap-4 bg-black/20 p-1 rounded-xl">
                <TabsTrigger
                  value="activity"
                  className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg transition-all duration-200"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Activity
                </TabsTrigger>
                <TabsTrigger
                  value="challenges"
                  className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg transition-all duration-200"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Challenges
                </TabsTrigger>
                <TabsTrigger
                  value="circles"
                  className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg transition-all duration-200"
                >
                  <Circle className="h-4 w-4 mr-2" />
                  Circles
                </TabsTrigger>
                <TabsTrigger
                  value="leaderboard"
                  className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg transition-all duration-200"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Leaderboard
                </TabsTrigger>
              </TabsList>

              <TabsContent value="activity" className="mt-6">
                <FriendActivity />
              </TabsContent>

              <TabsContent value="challenges" className="mt-6">
                <FriendChallenges />
              </TabsContent>

              <TabsContent value="circles" className="mt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">Circles</h2>
                    <Dialog open={isCreateCircleOpen} onOpenChange={setIsCreateCircleOpen}>
                      <DialogTrigger asChild>
                        <Button
                          className="bg-purple-500 hover:bg-purple-600"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Circle
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-900 border-purple-500/20">
                        <DialogHeader>
                          <DialogTitle className="text-white">Create a New Circle</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <Input
                            placeholder="Circle Name"
                            className="bg-black/20 border-purple-500/20"
                          />
                          <Button
                            className="w-full bg-purple-500 hover:bg-purple-600"
                            onClick={() => {
                              toast({
                                title: "Circle Created!",
                                description: "Invite your friends to join your circle.",
                              });
                              setIsCreateCircleOpen(false);
                            }}
                          >
                            Create Circle
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="grid gap-4">
                    {circles?.map((circle) => (
                      <motion.div
                        key={circle.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20 backdrop-blur-sm"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold text-white">{circle.name}</h3>
                              {circle.isOwner && (
                                <Crown className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-300">
                              {circle.memberCount} members
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-white/10"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </div>

                        {circle.activeChallenge && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-purple-300">
                              Active Challenge: {circle.activeChallenge.title}
                            </p>
                            <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-500"
                                style={{ width: `${circle.activeChallenge.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
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
          </div>
        </div>
      </motion.div>
    </div>
  );
}