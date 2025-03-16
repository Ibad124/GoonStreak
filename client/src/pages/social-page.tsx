import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Activity, Trophy, Target } from "lucide-react";
import FriendActivity from "@/components/FriendActivity";
import FriendChallenges from "@/components/FriendChallenges";
import ActiveFriends from "@/components/ActiveFriends";
import FriendsLeaderboard from "@/components/FriendsLeaderboard";

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState("activity");

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
              <TabsList className="grid grid-cols-3 gap-4 bg-black/20 p-1 rounded-xl">
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

              <TabsContent value="leaderboard" className="mt-6">
                <FriendsLeaderboard />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Active Friends & Stats */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-black/20 border-purple-500/20 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-400" />
                  Active Friends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ActiveFriends />
              </CardContent>
            </Card>

            {/* Additional social stats or friend suggestions can go here */}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
