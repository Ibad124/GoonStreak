import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StreakStats from "@/components/StreakStats";
import Achievements from "@/components/Achievements";
import LevelProgress from "@/components/LevelProgress";
import LogSessionModal from "@/components/LogSessionModal";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Menu, Film, Trophy, Star, Flame } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Challenges from "@/components/Challenges";
import { Link } from "wouter";
import { motion } from "framer-motion";

interface StatsData {
  user: {
    currentStreak: number;
    longestStreak: number;
    totalSessions: number;
    todaySessions: number;
    xpPoints: number;
    title: string;
    level: number;
    lastSessionDate: string | null;
  };
  nextLevelXP: number;
  currentLevelXP: number;
  challenges: any[];
  achievements: any[];
}

const themeStyles = {
  default: {
    background: "from-indigo-50 via-blue-50 to-sky-50",
    headerBg: "bg-white/90",
    cardBg: "bg-white/90",
    text: "text-indigo-950",
    accent: "text-indigo-500",
    button: "from-indigo-500 via-blue-500 to-sky-500",
    border: "border-indigo-100"
  },
  solo: {
    background: "from-zinc-900 via-slate-900 to-neutral-900",
    headerBg: "bg-zinc-900/90",
    cardBg: "bg-zinc-900/90",
    text: "text-emerald-100",
    accent: "text-emerald-400",
    button: "from-emerald-500 via-teal-500 to-cyan-500",
    border: "border-emerald-900"
  },
  competitive: {
    background: "from-fuchsia-900 via-purple-900 to-violet-900",
    headerBg: "bg-fuchsia-900/90",
    cardBg: "bg-fuchsia-900/90",
    text: "text-fuchsia-100",
    accent: "text-fuchsia-400",
    button: "from-fuchsia-500 via-purple-500 to-violet-500",
    border: "border-fuchsia-900"
  },
  hardcore: {
    background: "from-rose-950 via-red-950 to-rose-900",
    headerBg: "bg-rose-950/90",
    cardBg: "bg-rose-950/90",
    text: "text-rose-100",
    accent: "text-rose-400",
    button: "from-rose-600 via-red-600 to-rose-500",
    border: "border-rose-900"
  }
};

const characterMessages = {
  solo: {
    sessionLogged: "STREAK RECORDED. POWER LEVEL INCREASING... 🤖",
    levelUp: "SYSTEM UPGRADE COMPLETE. NEW RANK ACHIEVED: ",
    xpGained: "EXPERIENCE POINTS ACQUIRED: ",
  },
  competitive: {
    sessionLogged: "Great job, streaker! Keep that momentum going! 💖",
    levelUp: "OMG! You just leveled up to ",
    xpGained: "You earned ",
  },
  hardcore: {
    sessionLogged: "Your dedication pleases me... Your streak grows stronger. 😈",
    levelUp: "Your power rises... You have ascended to ",
    xpGained: "Dark energy acquired: ",
  },
  default: {
    sessionLogged: "Session logged successfully!",
    levelUp: "Level up! You're now ",
    xpGained: "XP gained: ",
  }
};

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const { preferences } = useTheme();
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  const { data: stats, isLoading } = useQuery<StatsData>({
    queryKey: ["/api/stats"],
  });

  const messages = characterMessages[preferences.goonStyle] || characterMessages.default;

  const sessionMutation = useMutation({
    mutationFn: async (sessionData) => {
      const res = await apiRequest("POST", "/api/session", sessionData);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });

      toast({
        title: "Session Logged",
        description: messages.sessionLogged,
        variant: "default",
      });

      const xpGained = data.user.xpPoints - (stats?.user.xpPoints || 0);
      toast({
        title: "XP Gained!",
        description: `${messages.xpGained}+${xpGained} XP`,
        variant: "default",
      });

      if (data.leveledUp) {
        toast({
          title: "Level Up!",
          description: `${messages.levelUp}${data.user.title}!`,
          variant: "default",
        });
      }

      data.newAchievements?.forEach((achievement) => {
        toast({
          title: "Achievement Unlocked!",
          description: achievement.description,
          variant: "default",
        });
      });

      setIsSessionModalOpen(false);
    },
  });

  const style = themeStyles[preferences.goonStyle] || themeStyles.default;

  if (isLoading || !stats) {
    return (
      <div className={`flex items-center justify-center min-h-screen bg-gradient-to-br ${style.background}`}>
        <Loader2 className={`h-8 w-8 animate-spin ${style.accent}`} />
      </div>
    );
  }

  return (
    <>
      <div className={`min-h-screen pb-20 relative overflow-hidden bg-gradient-to-br ${style.background}`}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwbDIwLTIwTTAgNDBsMjAtMjBNMTAgNTBsMjAtMjAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIiBzdHJva2Utd2lkdGg9IjIiLz48L3BhdHRlcm4+PC9kZWZzPjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik0wIDBoMjAwdjIwMEgweiIvPjwvc3ZnPg==')]" />
        </div>

        <motion.header 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className={`fixed top-0 left-0 right-0 ${style.headerBg} backdrop-blur-lg z-50 border-b ${style.border}`}
        >
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1"
              >
                <Star className={`h-5 w-5 ${style.accent}`} />
                <span className={`font-bold tracking-tight text-xl bg-gradient-to-r ${style.button} text-transparent bg-clip-text`}>
                  {user?.username}
                </span>
              </motion.div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className={style.text}
              >
                • Level {stats.user.level}
              </motion.div>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className={`rounded-full ${style.text} hover:${style.accent}`}>
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className={`bg-gradient-to-br ${style.background} ${style.border}`}>
                <div className="space-y-4 mt-8">
                  <Link href="/adult-content">
                    <Button
                      variant="outline"
                      className={`w-full rounded-full flex items-center bg-white/5 ${style.border} ${style.text} hover:bg-white/10`}
                    >
                      <Film className="h-4 w-4 mr-2" />
                      Adult Content
                    </Button>
                  </Link>
                  <Link href="/leaderboard">
                    <Button
                      variant="outline"
                      className={`w-full rounded-full flex items-center bg-white/5 ${style.border} ${style.text} hover:bg-white/10`}
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      Leaderboard
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    className={`w-full rounded-full bg-pink-900/50 hover:bg-pink-900/80`}
                    onClick={() => logoutMutation.mutate()}
                  >
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </motion.header>

        <main className="container mx-auto px-4 pt-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-6">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {stats && (
                  <LevelProgress
                    user={stats.user}
                    nextLevelXP={stats.nextLevelXP}
                    currentLevelXP={stats.currentLevelXP}
                    style={preferences.goonStyle}
                  />
                )}
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className={`overflow-hidden ${style.cardBg} backdrop-blur-xl ${style.border} hover:bg-opacity-100 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-current/10 transform-gpu rounded-2xl`}>
                  <CardHeader>
                    <CardTitle className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${style.text}`}>
                      <Flame className={`${style.accent}`} />
                      Your Streak
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StreakStats stats={stats} />
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className={`overflow-hidden ${style.cardBg} backdrop-blur-xl ${style.border} hover:bg-opacity-100 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-current/10 transform-gpu rounded-2xl`}>
                  <CardHeader>
                    <CardTitle className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${style.text}`}>
                      <Trophy className={`${style.accent}`} />
                      Daily Challenges
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Challenges challenges={stats?.challenges || []} />
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Card className={`overflow-hidden ${style.cardBg} backdrop-blur-xl ${style.border} hover:bg-opacity-100 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-current/10 transform-gpu rounded-2xl`}>
                  <CardHeader>
                    <CardTitle className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${style.text}`}>
                      <Star className={`${style.accent}`} />
                      Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className={style.text}>
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
          </div>
        </main>

        <LogSessionModal
          isOpen={isSessionModalOpen}
          onClose={() => setIsSessionModalOpen(false)}
          onSubmit={(data) => sessionMutation.mutate(data)}
          isPending={sessionMutation.isPending}
        />

        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className={`fixed bottom-0 left-0 right-0 p-4 ${style.headerBg} backdrop-blur ${style.border}`}
        >
          <div className="container mx-auto max-w-lg">
            <Button
              className={`w-full h-16 text-lg rounded-full bg-gradient-to-r ${style.button} hover:brightness-110 transition-all duration-500 shadow-lg shadow-current/20 hover:shadow-2xl hover:shadow-current/30 font-bold tracking-wide text-white transform-gpu hover:scale-[1.02]`}
              size="lg"
              onClick={() => setIsSessionModalOpen(true)}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2"
              >
                <Flame className="h-6 w-6" />
                Log Session
              </motion.div>
            </Button>
          </div>
        </motion.div>
      </div>
    </>
  );
}