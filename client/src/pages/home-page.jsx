import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StreakStats from "@/components/StreakStats";
import Achievements from "@/components/Achievements";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Menu, Film, Users, Trophy, Flame, Activity, PlusCircle, Clock, Star, Heart } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Challenges from "@/components/Challenges";
import { motion } from "framer-motion";
import FriendsList from "@/components/FriendsList";
import LogSessionModal from '@/components/LogSessionModal';

const menuItems = [
  {
    title: "Social Hub",
    icon: Users,
    href: "/social",
    description: "Connect with friends and start circle sessions together",
    color: "bg-gradient-to-br from-purple-500 to-indigo-600",
    stats: "12 friends online"
  },
  {
    title: "Adult Content",
    icon: Film,
    href: "/adult-content",
    description: "Premium adult content curated just for you",
    color: "bg-gradient-to-br from-pink-500 to-rose-600",
    stats: "1000+ videos"
  },
  {
    title: "Leaderboard",
    icon: Trophy,
    href: "/leaderboard",
    description: "Compete with others and climb the rankings",
    color: "bg-gradient-to-br from-amber-500 to-yellow-600",
    stats: "Top 100 players"
  },
  {
    title: "Daily Streaks",
    icon: Flame,
    href: "/streaks",
    description: "Keep your momentum going with daily activities",
    color: "bg-gradient-to-br from-orange-500 to-red-600",
    stats: "Current: 5 days"
  },
  {
    title: "Latest Updates",
    icon: Star,
    href: "/updates",
    description: "Check out new features and improvements",
    color: "bg-gradient-to-br from-cyan-500 to-blue-600",
    stats: "3 new updates"
  }
];

const defaultUser = {
  username: "Guest User",
};

// Animation variants
const containerAnimation = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemAnimation = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const menuItemAnimation = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: { type: "spring", stiffness: 400, damping: 10 }
  },
  tap: { scale: 0.98 }
};

// Sample rewards data
const rewards = [
  { id: 1, name: "Early Bird", description: "Complete a session before 8 AM", points: 50, icon: Clock },
  { id: 2, name: "Streak Master", description: "Maintain a 7-day streak", points: 100, icon: Flame },
  { id: 3, name: "Social Butterfly", description: "Join 3 group sessions", points: 75, icon: Users },
];

// Sample goals data
const goals = [
  { id: 1, title: "Daily Meditation", current: 3, target: 5, unit: "sessions" },
  { id: 2, title: "Weekly Social Calls", current: 2, target: 4, unit: "calls" },
  { id: 3, title: "Monthly Achievements", current: 8, target: 10, unit: "achievements" },
];

export default function HomePage() {
  const { toast } = useToast();
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
    initialData: {
      user: defaultUser,
      challenges: [],
      achievements: []
    }
  });

  const sessionMutation = useMutation({
    mutationFn: async (sessionData) => {
      const res = await apiRequest("POST", "/api/session", sessionData);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/stats"], (oldData) => ({
        ...oldData,
        user: data.user,
        challenges: data.challenges,
      }));

      toast({
        title: "Session Logged",
        description: "Your streak has been updated!",
      });

      data.newAchievements?.forEach((achievement) => {
        toast({
          title: "Achievement Unlocked!",
          description: achievement.description,
          variant: "default",
        });
      });

      data.completedChallenges?.forEach((completion) => {
        toast({
          title: "Challenge Completed!",
          description: `${completion.challenge.title}`,
          variant: "default",
        });
      });

      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });

  const handleSessionSubmit = (sessionData) => {
    sessionMutation.mutate(sessionData);
    setIsSessionModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 z-50 border-b border-zinc-200/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <motion.h1
            className="text-xl font-semibold tracking-tight bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Welcome, {stats.user.username}!
          </motion.h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full hover:scale-105 transition-transform active:scale-95"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-[450px] p-0 flex flex-col">
              <SheetHeader className="p-6 bg-gradient-to-br from-blue-600 to-blue-800 text-white shrink-0">
                <SheetTitle className="text-2xl font-bold text-white flex items-center gap-2">
                  <Heart className="h-6 w-6" />
                  Main Menu
                </SheetTitle>
                <p className="text-blue-100 mt-2">Explore features and connect with others</p>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 sm:p-6 space-y-4">
                  <div className="grid gap-3">
                    {menuItems.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <motion.div
                          variants={menuItemAnimation}
                          initial="initial"
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <Button
                            variant="outline"
                            className="w-full h-auto p-4 flex flex-col items-start gap-3 group relative overflow-hidden"
                          >
                            <div className={`${item.color} p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow`}>
                              <item.icon className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-left w-full">
                              <div className="font-semibold text-lg flex items-center justify-between">
                                {item.title}
                                <span className="text-xs font-medium text-blue-600">{item.stats}</span>
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">{item.description}</div>
                            </div>
                          </Button>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="container mx-auto px-4">
        <motion.div 
          className="flex min-h-screen pt-24 pb-32 gap-6"
          variants={containerAnimation}
          initial="hidden"
          animate="show"
        >
          <div className="flex-1 space-y-6">
            {/* Goals Section */}
            <motion.div variants={itemAnimation}>
              <Card className="overflow-hidden backdrop-blur bg-white/80 border-zinc-200/50 shadow-lg shadow-blue-900/5">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold tracking-tight">
                    Your Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {goals.map(goal => (
                      <div key={goal.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{goal.title}</span>
                          <span className="text-sm text-muted-foreground">
                            {goal.current}/{goal.target} {goal.unit}
                          </span>
                        </div>
                        <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${(goal.current / goal.target) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemAnimation}>
              <Card className="overflow-hidden backdrop-blur bg-white/80 border-zinc-200/50 shadow-lg shadow-blue-900/5">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold tracking-tight">
                    Daily Challenges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Challenges challenges={stats?.challenges || []} />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemAnimation}>
              <Card className="overflow-hidden backdrop-blur bg-white/80 border-zinc-200/50 shadow-lg shadow-blue-900/5">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold tracking-tight">
                    Your Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <StreakStats stats={stats} />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemAnimation}>
              <Card className="overflow-hidden backdrop-blur bg-white/80 border-zinc-200/50 shadow-lg shadow-blue-900/5">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold tracking-tight">
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Achievements achievements={stats?.achievements || []} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Rewards Section */}
            <motion.div variants={itemAnimation}>
              <Card className="overflow-hidden backdrop-blur bg-white/80 border-zinc-200/50 shadow-lg shadow-blue-900/5">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold tracking-tight">
                    Available Rewards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {rewards.map(reward => (
                      <div key={reward.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <reward.icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{reward.name}</h3>
                          <p className="text-sm text-muted-foreground">{reward.description}</p>
                        </div>
                        <div className="ml-auto text-sm font-medium text-blue-600">
                          {reward.points} points
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="hidden lg:block w-96">
            <div className="sticky top-24">
              <FriendsList />
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 border-t border-zinc-200/50"
      >
        <div className="container mx-auto max-w-lg">
          <Button
            className="w-full h-14 text-lg rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transform hover:scale-[1.02] active:scale-[0.98]"
            size="lg"
            onClick={() => setIsSessionModalOpen(true)}
            disabled={sessionMutation.isPending}
          >
            {sessionMutation.isPending ? (
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
            ) : (
              <PlusCircle className="h-6 w-6 mr-2" />
            )}
            Log Session
          </Button>
          <LogSessionModal
            isOpen={isSessionModalOpen}
            onClose={() => setIsSessionModalOpen(false)}
            onSubmit={handleSessionSubmit}
            isPending={sessionMutation.isPending}
          />
        </div>
      </motion.div>
    </div>
  );
}