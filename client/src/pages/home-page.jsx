import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { STREAK_CONFIG } from "../../shared/schema.ts";
import {
  Loader2,
  Film,
  Users,
  Trophy,
  Flame,
  PlusCircle,
  Clock,
  Star,
  Heart,
  Award
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import FriendsList from "@/components/FriendsList";
import LogSessionModal from '@/components/LogSessionModal';
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from 'date-fns';

// Helper functions for streak milestones
const getNextMilestone = (currentStreak) => {
  return Object.keys(STREAK_CONFIG.MULTIPLIER_MILESTONES)
    .map(Number)
    .find(days => days > currentStreak) || currentStreak;
};

const getNextSessionMilestone = (totalSessions) => {
  const milestones = [10, 25, 50, 100, 250, 500, 1000];
  return milestones.find(m => m > totalSessions) || totalSessions;
};

const getDaysToNextMilestone = (currentStreak) => {
  const nextMilestone = getNextMilestone(currentStreak);
  return nextMilestone - currentStreak;
};

// Level system configuration
const levels = [
  { level: 1, points: 0, badge: "Novice", color: "from-zinc-500 to-slate-600" },
  { level: 2, points: 100, badge: "Apprentice", color: "from-blue-500 to-blue-600" },
  { level: 3, points: 300, badge: "Intermediate", color: "from-green-500 to-green-600" },
  { level: 4, points: 600, badge: "Advanced", color: "from-purple-500 to-purple-600" },
  { level: 5, points: 1000, badge: "Expert", color: "from-yellow-500 to-yellow-600" },
  { level: 6, points: 2000, badge: "Master", color: "from-red-500 to-red-600" },
  { level: 7, points: 5000, badge: "Grandmaster", color: "from-pink-500 to-pink-600" },
  { level: 8, points: 10000, badge: "Legend", color: "from-orange-500 to-orange-600" }
];

// Navigation menu items
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
  }
];


// Animation variants
const containerAnimation = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
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

const getCurrentLevel = (points) => {
  for (let i = levels.length - 1; i >= 0; i--) {
    if (points >= levels[i].points) {
      return levels[i];
    }
  }
  return levels[0];
};

const getNextLevel = (points) => {
  for (let i = 0; i < levels.length; i++) {
    if (points < levels[i].points) {
      return levels[i];
    }
  }
  return levels[levels.length - 1];
};

const defaultUser = {
  username: "Guest User",
};

export default function HomePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  // Fetch user stats and achievements with auth
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
    initialData: {
      user: user || { username: "Guest User", xpPoints: 0 },
      challenges: [],
      achievements: [],
      nextLevelXP: 100,
      currentLevelXP: 0
    }
  });

  // Session logging mutation with auth
  const sessionMutation = useMutation({
    mutationFn: async (sessionData) => {
      const res = await apiRequest("POST", "/api/session", sessionData);
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to log session");
      }
      return res.json();
    },
    onSuccess: (data) => {
      // Update stats with new user data and achievements
      queryClient.setQueryData(["/api/stats"], (oldData) => ({
        ...oldData,
        user: data.user,
        nextLevelXP: data.nextLevelXP,
        currentLevelXP: data.currentLevelXP,
        achievements: [...(oldData?.achievements || []), ...(data.newAchievements || [])]
      }));

      // Show success toast with XP information
      toast({
        title: "Session Logged",
        description: (
          <div className="space-y-1">
            <p>+{data.xpAwarded} XP earned!</p>
            {data.multiplierApplied && (
              <p className="text-sm text-blue-600">
                {Math.round((data.multiplierApplied - 1) * 100)}% streak bonus applied!
              </p>
            )}
          </div>
        ),
      });

      // Show achievement toasts
      data.newAchievements?.forEach((achievement) => {
        toast({
          title: "Achievement Unlocked!",
          description: achievement.description,
          variant: "default",
        });
      });

      // Show level up toast if applicable
      if (data.leveledUp) {
        toast({
          title: "Level Up!",
          description: `You've reached level ${data.user.level}!`,
          variant: "default",
        });
      }

      // Force refresh stats
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to log session",
        variant: "destructive",
      });
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

  // Calculate level progress
  const userPoints = stats.user.xpPoints || 0;
  const currentLevel = getCurrentLevel(userPoints);
  const nextLevel = getNextLevel(userPoints);
  const progressToNextLevel = nextLevel.points === currentLevel.points ? 100 :
    ((userPoints - currentLevel.points) / (nextLevel.points - currentLevel.points)) * 100;


  const nextMilestone = getNextMilestone(stats.user.currentStreak);
  const daysToNextMilestone = getDaysToNextMilestone(stats.user.currentStreak);
  const nextSessionMilestone = getNextSessionMilestone(stats.user.totalSessions);


  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
      {/* Header */}
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

      {/* Main Content */}
      <div className="container mx-auto px-4">
        <motion.div
          className="flex min-h-screen pt-24 pb-32 gap-6"
          variants={containerAnimation}
          initial="hidden"
          animate="show"
        >
          <div className="flex-1 space-y-6">
            {/* Hero Section with Level Progress */}
            <motion.div
              variants={itemAnimation}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white p-8 shadow-xl"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Level {currentLevel.level}</h2>
                  <p className="text-blue-100">{currentLevel.badge}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{userPoints}</div>
                  <div className="text-blue-200 text-sm">Total Points</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-blue-100">
                    <span>Progress to {nextLevel.badge}</span>
                    <span>{Math.round(progressToNextLevel)}%</span>
                  </div>
                  <div className="h-3 bg-blue-900/30 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-blue-200 to-white"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressToNextLevel}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </div>
                  <p className="text-sm text-blue-200">
                    {nextLevel.points - userPoints} points needed for next level
                  </p>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {levels.map((level) => (
                    <div
                      key={level.level}
                      className={`p-2 rounded-lg text-center ${
                        userPoints >= level.points
                          ? 'bg-white/20 backdrop-blur'
                          : 'bg-blue-900/20'
                        }`}
                    >
                      <Award className={`h-4 w-4 mx-auto mb-1 ${
                        userPoints >= level.points ? 'text-white' : 'text-blue-300/50'
                        }`} />
                      <div className={`text-xs font-medium ${
                        userPoints >= level.points ? 'text-white' : 'text-blue-300/50'
                        }`}>
                        {level.badge}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative background elements */}
              <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-white/10" />
              <div className="absolute -right-4 -bottom-4 w-32 h-32 rounded-full bg-white/5" />
            </motion.div>


            {/* Streak Stats - Now more prominent since we removed goals */}
            <motion.div variants={itemAnimation}>
              <Card className="overflow-hidden backdrop-blur bg-white/80 border-zinc-200/50 shadow-lg shadow-blue-900/5">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold tracking-tight flex items-center justify-between">
                    Your Streak
                    {stats.user.streakMultiplier > 1 && (
                      <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                        {Math.round((stats.user.streakMultiplier - 1) * 100)}% XP Bonus
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl">
                      <div className="text-3xl font-bold text-blue-600">{stats.user.currentStreak}</div>
                      <div className="text-sm text-muted-foreground mt-1">Current Streak</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl">
                      <div className="text-3xl font-bold text-blue-600">{stats.user.longestStreak}</div>
                      <div className="text-sm text-muted-foreground mt-1">Best Streak</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl">
                      <div className="text-3xl font-bold text-blue-600">{stats.user.todaySessions}</div>
                      <div className="text-sm text-muted-foreground mt-1">Today's Sessions</div>
                    </div>
                  </div>

                  {/* Next Streak Milestone */}
                  {stats.user.currentStreak > 0 && (
                    <div className="space-y-2 p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl">
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <h4 className="font-medium">Next Streak Milestone</h4>
                          {Object.entries(STREAK_CONFIG.MULTIPLIER_MILESTONES).filter(([days]) =>
                            parseInt(days) > stats.user.currentStreak
                          ).map(([days, multiplier]) => (
                            <p key={days} className="text-sm text-muted-foreground">
                              {STREAK_CONFIG.MILESTONE_ACHIEVEMENTS[days]} at {days} days
                              <span className="text-purple-600 ml-2">
                                ({Math.round((multiplier - 1) * 100)}% bonus)
                              </span>
                            </p>
                          ))}
                        </div>
                        <Star className="h-8 w-8 text-purple-500" />
                      </div>
                      <div className="h-2 bg-purple-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-purple-500"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(stats.user.currentStreak / nextMilestone) * 100}%`
                          }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                      <p className="text-xs text-center text-muted-foreground">
                        {daysToNextMilestone} days until next milestone
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Achievements with Progress */}
            <motion.div variants={itemAnimation}>
              <Card className="overflow-hidden backdrop-blur bg-white/80 border-zinc-200/50 shadow-lg shadow-blue-900/5">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {/* Session Milestone Progress */}
                    <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">Session Master</h3>
                          <p className="text-sm text-muted-foreground">Complete daily sessions</p>
                        </div>
                        <Film className="h-6 w-6 text-blue-500" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress to next milestone</span>
                          <span>{stats.user.totalSessions} / {nextSessionMilestone}</span>
                        </div>
                        <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-blue-500"
                            initial={{ width: 0 }}
                            animate={{
                              width: `${(stats.user.totalSessions / nextSessionMilestone) * 100}%`
                            }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Recent Achievements */}
                    <div className="grid gap-2">
                      {stats.achievements.slice(0, 3).map((achievement) => (
                        <motion.div
                          key={achievement.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-3 p-3 bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-lg"
                        >
                          <div className="p-2 bg-yellow-500/10 rounded-lg">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                          </div>
                          <div>
                            <p className="font-medium">{achievement.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(achievement.earnedAt), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="ml-auto text-sm font-medium text-yellow-600">
                            +{achievement.xpAwarded} XP
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Friends List Sidebar */}
          <div className="hidden lg:block w-96">
            <div className="sticky top-24">
              <FriendsList />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Log Session Button */}
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
          <AnimatePresence>
            {isSessionModalOpen && (
              <LogSessionModal
                isOpen={isSessionModalOpen}
                onClose={() => setIsSessionModalOpen(false)}
                onSubmit={handleSessionSubmit}
                isPending={sessionMutation.isPending}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

const rewards = [
  { id: 1, name: "Early Bird", description: "Complete a session before 8 AM", points: 50, icon: Clock },
  { id: 2, name: "Streak Master", description: "Maintain a 7-day streak", points: 100, icon: Flame },
  { id: 3, name: "Social Butterfly", description: "Join 3 group sessions", points: 75, icon: Users },
];