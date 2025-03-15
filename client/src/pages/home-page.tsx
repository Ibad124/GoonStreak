import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
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
  Heart // Added import for Heart icon
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import StreakStats from "@/components/StreakStats";
import Achievements from "@/components/Achievements";
import LogSessionModal from "@/components/LogSessionModal";
import Challenges from "@/components/Challenges";
import SessionCalendar from "@/components/SessionCalendar";
import ActiveFriends from "@/components/ActiveFriends";
import { AiSuggestions } from "@/components/AiSuggestions";
import { SexAiChat } from "@/components/SexAiChat"; // Added import for SexAiChat component

interface Stats {
  user: {
    level: number;
    xpPoints: number;
    currentStreak: number;
    longestStreak: number;
    totalSessions: number;
    todaySessions: number;
  };
  nextLevelXP: number;
  rank?: number;
  challenges?: any[];
  achievements?: any[];
  sessions?: any[];
}

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const { preferences } = useTheme();
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

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

  const style = themeStyles[preferences.goonStyle] || themeStyles.default;

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
      <div className={`flex items-center justify-center min-h-screen bg-gradient-to-br ${style.background}`}>
        <Loader2 className={`h-8 w-8 animate-spin ${style.accent}`} />
      </div>
    );
  }

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
          <div className="flex items-center gap-3 min-w-0">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2"
            >
              <Award className={`h-5 w-5 ${style.accent}`} />
              <span className={`font-bold tracking-tight text-lg md:text-xl truncate bg-gradient-to-r ${style.button} text-transparent bg-clip-text`}>
                {user?.username}
              </span>
            </motion.div>
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className={`${style.text} text-sm md:text-base flex items-center gap-1`}
            >
              <Activity className="w-3 h-3" />
              <span>Level {stats.user.level}</span>
            </motion.div>
          </div>

          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu className={`h-5 w-5 ${style.text}`} />
                </Button>
              </SheetTrigger>
              <SheetContent className={`bg-gradient-to-br ${style.background} ${style.border}`}>
                <nav className="space-y-4 mt-8">
                  <Link href="/social">
                    <Button
                      variant="outline"
                      className={`w-full rounded-xl flex items-center justify-start gap-3 bg-white/5 ${style.border} ${style.text} hover:bg-white/10`}
                    >
                      <Users className="h-4 w-4" />
                      Social Hub
                    </Button>
                  </Link>
                  <Link href="/adult-content">
                    <Button
                      variant="outline"
                      className={`w-full rounded-xl flex items-center justify-start gap-3 bg-white/5 ${style.border} ${style.text} hover:bg-white/10`}
                    >
                      <Film className="h-4 w-4" />
                      Adult Content
                    </Button>
                  </Link>
                  <Link href="/leaderboard">
                    <Button
                      variant="outline"
                      className={`w-full rounded-xl flex items-center justify-start gap-3 bg-white/5 ${style.border} ${style.text} hover:bg-white/10`}
                    >
                      <Trophy className="h-4 w-4" />
                      Leaderboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className={`w-full rounded-xl flex items-center justify-start gap-3 bg-white/5 ${style.border} ${style.text} hover:bg-white/10`}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
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

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 pt-24 pb-6"
      >
        <div className={`${style.cardBg} backdrop-blur rounded-2xl p-6 md:p-8 ${style.border} hover:shadow-lg transition-all duration-300`}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center">
            {/* Left Column - Progress */}
            <div className="md:col-span-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${style.button} shadow-lg relative overflow-hidden group`}>
                  <Award className="h-8 w-8 md:h-10 md:w-10 text-white relative z-10" />
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0, 0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <motion.h2
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className={`text-xl md:text-3xl font-bold ${style.text} mb-2`}
                  >
                    {style.greeting}
                  </motion.h2>
                  <div className="flex items-center gap-2">
                    <Calendar className={`h-4 w-4 ${style.accent}`} />
                    <span className={`text-sm ${style.text} opacity-80`}>
                      Current Streak: {stats.user.currentStreak} days
                    </span>
                  </div>
                </div>
              </div>

              {/* Level Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-medium ${style.text}`}>Level Progress</h3>
                  <span className={`text-sm ${style.accent}`}>
                    {stats.user.xpPoints}/{stats.nextLevelXP} XP
                  </span>
                </div>
                <div className="h-2 bg-black/10 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${style.button}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(stats.user.xpPoints / stats.nextLevelXP) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Quick Stats */}
            <div className="md:col-span-4 grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`p-4 rounded-xl ${style.cardBg} border ${style.border}`}
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
                className={`p-4 rounded-xl ${style.cardBg} border ${style.border}`}
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
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-4 md:space-y-6">
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
          <div className="lg:col-span-4 space-y-4 md:space-y-6">
            {/* AI-Powered Growth Suggestions */}
            <Card className={`overflow-hidden ${style.cardBg} backdrop-blur ${style.border} hover:bg-black/30 transition-all duration-300`}>
              <CardHeader>
                <CardTitle className={`text-xl font-bold tracking-tight flex items-center gap-2 ${style.text}`}>
                  <Brain className={`${style.accent}`} />
                  Growth Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <AiSuggestions />
                </div>
              </CardContent>
            </Card>

            {/* Floating AI Chat Button */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="fixed bottom-24 right-4 z-50"
            >
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    className={`rounded-full w-14 h-14 shadow-lg ${style.button} hover:brightness-110 transition-all duration-300`}
                    size="icon"
                  >
                    <Heart className="w-6 h-6 text-white" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className={`text-xl font-bold tracking-tight flex items-center gap-2 ${style.text}`}>
                      <Heart className={`${style.accent}`} />
                      Intimate AI Chat
                    </DialogTitle>
                  </DialogHeader>
                  <SexAiChat />
                </DialogContent>
              </Dialog>
            </motion.div>


            {/* Active Friends Section */}
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

            {/* Session Calendar */}
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

      {/* Session Logging Button */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`fixed bottom-0 left-0 right-0 p-4 ${style.headerBg} backdrop-blur border-t ${style.border}`}
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
    background: "from-blue-50 via-indigo-50 to-violet-50",
    headerBg: "bg-white/80",
    cardBg: "bg-white/90",
    text: "text-slate-900",
    accent: "text-blue-600",
    button: "from-blue-600 to-indigo-600",
    border: "border-slate-200/50",
    greeting: "Ready to level up? 🌟",
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
    greeting: "SYSTEMS ONLINE. INITIATING SESSION... 🤖",
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
    greeting: "Ready to dominate? Let's go! 🔥",
    pattern: "opacity-10"
  },
  hardcore: {
    background: "from-red-950 via-black to-red-950",
    headerBg: "bg-black/40",
    cardBg: "bg-black/40",
    text: "text-red-50",
    accent: "text-red-500",
    button: "from-red-600 to-red-700",
    border: "border-red-500/20",
    greeting: "Embrace the power within... 😈",
    pattern: "opacity-15"
  }
};