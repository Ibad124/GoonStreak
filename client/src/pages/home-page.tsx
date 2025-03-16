import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Menu,
  Film,
  Trophy,
  Star,
  Flame,
  Clock,
  Users,
  Target,
  Sparkles,
  Activity,
  Award,
  Calendar,
  Settings,
  Loader2,
  Plus,
  Brain,
  Heart,
  ChevronRight
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import LevelProgress from "@/components/LevelProgress";
import StreakStats from "@/components/StreakStats";
import Achievements from "@/components/Achievements";
import LogSessionModal from "@/components/LogSessionModal";
import Challenges from "@/components/Challenges";
import SessionCalendar from "@/components/SessionCalendar";
import ActiveFriends from "@/components/ActiveFriends";
import { calculateLevel } from "@/lib/utils";

interface Stats {
  user: {
    id: number;
    username: string;
    xpPoints: number;
    level: number;
    currentStreak: number;
    longestStreak: number;
    totalSessions: number;
    todaySessions: number;
    showOnLeaderboard: boolean;
    isAnonymous: boolean;
  };
  rank?: number;
  challenges?: Array<{
    id: number;
    title: string;
    description: string;
    progress: number;
    completed: boolean;
  }>;
  achievements?: Array<{
    id: number;
    type: string;
    description: string;
    earnedAt: string;
    xpAwarded: number;
  }>;
  sessions?: Array<{
    id: number;
    timestamp: string;
    duration: number;
    intensity: number;
    mood: number;
  }>;
}

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const { preferences } = useTheme();
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const style = themeStyles[preferences.goonStyle] || themeStyles.default;

  const { data: stats, isLoading, error } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-destructive">Error loading data</h2>
            <p className="text-sm text-muted-foreground mt-2">Please refresh the page to try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sessionMutation = useMutation({
    mutationFn: async (sessionData) => {
      const res = await apiRequest("POST", "/api/session", sessionData);
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Failed to log session');
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setIsSessionModalOpen(false);
      toast({
        title: "Session Logged Successfully! 🎉",
        description: `Great work! You've earned ${data.xpGained} XP!`,
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Log Session",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });

  if (isLoading || !stats) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${style.background}`}>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Loader2 className={`h-12 w-12 animate-spin ${style.accent}`} />
        </motion.div>
      </div>
    );
  }

  const levelInfo = calculateLevel(stats.user.xpPoints);

  return (
    <div className={`min-h-screen pb-24 relative overflow-hidden bg-gradient-to-br ${style.background}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute inset-0 ${style.pattern} bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwbDIwLTIwTTAgNDBsMjAtMjBNMTAgNTBsMjAtMjAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIiBzdHJva2Utd2lkdGg9IjIiLz48L3BhdHRlcm4+PC9kZWZzPjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik0wIDBoMjAwdjIwMEgweiIvPjwvc3ZnPg==')]`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 ${style.headerBg} backdrop-blur-lg z-50 border-b ${style.border}`}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2"
            >
              <div className={`p-2 rounded-xl bg-gradient-to-br ${style.button} relative overflow-hidden group`}>
                <Award className="h-5 w-5 text-white relative z-10" />
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0, 0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div className="flex flex-col">
                <span className={`font-bold tracking-tight text-lg truncate bg-gradient-to-r ${style.button} text-transparent bg-clip-text`}>
                  {user?.username}
                </span>
                <div className={`${style.text} text-sm flex items-center gap-1`}>
                  <Activity className="w-3 h-3" />
                  <span>Level {levelInfo.currentLevel}</span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/leaderboard">
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-xl bg-white/5 ${style.border} hover:bg-white/10`}
              >
                <Trophy className={`h-5 w-5 ${style.text}`} />
              </Button>
            </Link>

            <Link href="/social">
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-xl bg-white/5 ${style.border} hover:bg-white/10`}
              >
                <Users className={`h-5 w-5 ${style.text}`} />
              </Button>
            </Link>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-xl bg-white/5 ${style.border} hover:bg-white/10`}
                >
                  <Menu className={`h-5 w-5 ${style.text}`} />
                </Button>
              </SheetTrigger>
              <SheetContent className={`bg-gradient-to-br ${style.background} ${style.border}`}>
                <nav className="space-y-4 mt-8">
                  <Link href="/adult-content">
                    <Button
                      variant="outline"
                      className={`w-full rounded-xl flex items-center justify-between gap-3 bg-white/5 ${style.border} ${style.text} hover:bg-white/10`}
                    >
                      <div className="flex items-center gap-3">
                        <Film className="h-4 w-4" />
                        Adult Content
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className={`w-full rounded-xl flex items-center justify-between gap-3 bg-white/5 ${style.border} ${style.text} hover:bg-white/10`}
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="h-4 w-4" />
                      Settings
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full rounded-xl bg-pink-900/50 hover:bg-pink-900/80"
                    onClick={() => logoutMutation.mutate()}
                  >
                    Logout
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24">
        {/* Level Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <LevelProgress user={stats.user} />
        </motion.div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Daily Challenges */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className={`overflow-hidden ${style.cardBg} backdrop-blur ${style.border} hover:bg-black/30 transition-all duration-300`}>
                <CardHeader>
                  <CardTitle className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${style.text}`}>
                    <Target className={`${style.accent}`} />
                    Daily Challenges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Challenges challenges={stats?.challenges || []} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className={`overflow-hidden ${style.cardBg} backdrop-blur ${style.border} hover:bg-black/30 transition-all duration-300`}>
                <CardHeader>
                  <CardTitle className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${style.text}`}>
                    <Trophy className={`${style.accent}`} />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Achievements
                    achievements={stats?.achievements || []}
                    stats={{
                      currentStreak: stats?.user?.currentStreak || 0,
                      totalSessions: stats?.user?.totalSessions || 0
                    }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-4 rounded-xl ${style.cardBg} border ${style.border} hover:bg-black/30 transition-all duration-300`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Flame className={`h-4 w-4 ${style.accent}`} />
                  <span className={`text-sm font-medium ${style.text}`}>Best Streak</span>
                </div>
                <p className={`text-2xl font-bold ${style.text}`}>
                  {stats.user.longestStreak}
                  <span className="text-sm ml-1">days</span>
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-4 rounded-xl ${style.cardBg} border ${style.border} hover:bg-black/30 transition-all duration-300`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className={`h-4 w-4 ${style.accent}`} />
                  <span className={`text-sm font-medium ${style.text}`}>Rank</span>
                </div>
                <p className={`text-2xl font-bold ${style.text}`}>
                  #{stats.rank || "??"}
                </p>
              </motion.div>
            </div>

            {/* Active Friends */}
            <Card className={`overflow-hidden ${style.cardBg} backdrop-blur ${style.border} hover:bg-black/30 transition-all duration-300`}>
              <CardHeader>
                <CardTitle className={`text-xl font-bold tracking-tight flex items-center gap-2 ${style.text}`}>
                  <Users className={`${style.accent}`} />
                  Active Friends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ActiveFriends />
              </CardContent>
            </Card>

            {/* Calendar */}
            <Card className={`overflow-hidden ${style.cardBg} backdrop-blur ${style.border} hover:bg-black/30 transition-all duration-300`}>
              <CardHeader>
                <CardTitle className={`text-xl font-bold tracking-tight flex items-center gap-2 ${style.text}`}>
                  <Calendar className={`${style.accent}`} />
                  Activity Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SessionCalendar
                  sessions={stats?.sessions || []}
                  currentStreak={stats?.user?.currentStreak || 0}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent"
      >
        <div className="container mx-auto max-w-lg">
          <Button
            className={`
              w-full h-16 text-lg rounded-2xl
              bg-gradient-to-r ${style.button} 
              hover:brightness-110 transition-all duration-300 
              shadow-lg shadow-current/20 hover:shadow-xl hover:shadow-current/30 
              font-bold tracking-wide text-white transform hover:scale-[1.02]
              relative overflow-hidden group
            `}
            size="lg"
            onClick={() => setIsSessionModalOpen(true)}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 justify-center relative z-10"
            >
              <Sparkles className="h-6 w-6" />
              <span className="relative">Log Session</span>
            </motion.div>
            <motion.div
              className="absolute inset-0 bg-white/20"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [1, 1.5, 1], opacity: [0, 0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </Button>
        </div>
      </motion.div>

      {/* Modals */}
      <LogSessionModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        onSubmit={(data) => sessionMutation.mutate(data)}
        isPending={sessionMutation.isPending}
      />
    </div>
  );
}

const themeStyles = {
  default: {
    background: "from-pink-50 via-purple-50 to-blue-50",
    headerBg: "bg-white/80",
    cardBg: "bg-white/90",
    text: "text-slate-900",
    accent: "text-pink-600",
    button: "from-pink-600 to-purple-600",
    border: "border-slate-200/50",
    pattern: "opacity-5"
  },
  solo: {
    background: "from-emerald-950 via-slate-900 to-emerald-950",
    headerBg: "bg-black/40",
    cardBg: "bg-black/40",
    text: "text-emerald-50",
    accent: "text-emerald-400",
    button: "from-emerald-500 to-emerald-600",
    border: "border-emerald-400/20",
    pattern: "opacity-10"
  },
  competitive: {
    background: "from-pink-500 via-purple-600 to-indigo-600",
    headerBg: "bg-black/30",
    cardBg: "bg-black/30",
    text: "text-pink-50",
    accent: "text-pink-400",
    button: "from-pink-500 to-purple-500",
    border: "border-pink-400/20",
    pattern: "opacity-10"
  },
  hardcore: {
    background: "from-pink-950 via-black to-purple-950",
    headerBg: "bg-black/40",
    cardBg: "bg-black/40",
    text: "text-pink-50",
    accent: "text-pink-500",
    button: "from-pink-600 to-purple-700",
    border: "border-pink-500/20",
    pattern: "opacity-15"
  }
};