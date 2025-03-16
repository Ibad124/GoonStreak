import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Users,
  Trophy,
  Target,
  MessageSquare,
  Star,
  Crown,
  Plus
} from "lucide-react";
import FriendsList from "@/components/FriendsList";
import FriendActivity from "@/components/FriendActivity";
import SocialAchievements from "@/components/SocialAchievements";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import FriendsLeaderboard from "@/components/FriendsLeaderboard";

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
  const [activeTab, setActiveTab] = useState("activity");

  //Removed useQuery hook as it's not present in edited code.

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-slate-900 to-pink-900">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <h1 className="text-2xl font-bold mb-4 text-white">Please log in to continue</h1>
          <Link href="/auth">
            <Button className="bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              Login
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-pink-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c3VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwbDIwLTIwTTAgNDBsMjAtMjBNMTAgNTBsMjAtMjAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIiBzdHJva2Utd2lkdGg9IjIiLz48L3BhdHRlcm4+PC9kZWZzPjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik0wIDBoMjAwdjIwMEgweiIvPjwvc3ZnPg==')]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 bg-black/40 backdrop-blur z-50 border-b border-white/10"
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full text-white hover:text-purple-400">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <motion.h1
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-lg md:text-xl font-semibold text-white truncate"
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
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 pb-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Left Column - Friends List */}
          <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
            <Card className="bg-black/20 border-white/10 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-400" />
                  Friends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FriendsList />
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Social Content */}
          <motion.div variants={itemVariants} className="lg:col-span-8 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 gap-4 bg-black/20 p-1 rounded-xl">
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
              </TabsList>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="mt-6"
                >
                  <TabsContent value="activity">
                    <Card className="bg-black/20 border-white/10 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Target className="h-5 w-5 text-purple-400" />
                          Friend Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <FriendActivity />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="achievements">
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
                  </TabsContent>

                  <TabsContent value="leaderboard">
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
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </motion.div>
        </motion.div>
      </main>

      {/* Floating Action Button */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
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
      </motion.div>
    </div>
  );
}