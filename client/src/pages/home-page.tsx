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

const themeStyles = {
  default: {
    background: "from-zinc-50 to-blue-50",
    headerBg: "bg-white/80",
    cardBg: "bg-white/80",
    text: "text-zinc-900",
    accent: "text-blue-500",
    button: "from-blue-500 to-blue-600",
    border: "border-zinc-200/50"
  },
  solo: {
    background: "from-slate-900 to-zinc-900",
    headerBg: "bg-black/20",
    cardBg: "bg-black/20",
    text: "text-zinc-100",
    accent: "text-emerald-500",
    button: "from-emerald-500 to-emerald-600",
    border: "border-white/10"
  },
  competitive: {
    background: "from-purple-900 to-pink-900",
    headerBg: "bg-black/20",
    cardBg: "bg-black/20",
    text: "text-pink-100",
    accent: "text-pink-500",
    button: "from-pink-500 to-purple-500",
    border: "border-white/10"
  },
  hardcore: {
    background: "from-red-950 to-black",
    headerBg: "bg-black/20",
    cardBg: "bg-black/20",
    text: "text-red-100",
    accent: "text-red-500",
    button: "from-red-500 to-red-600",
    border: "border-white/10"
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

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  const messages = characterMessages[preferences.goonStyle] || characterMessages.default;
  const style = themeStyles[preferences.goonStyle] || themeStyles.default;

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
                <Card className={`overflow-hidden ${style.cardBg} backdrop-blur ${style.border} hover:bg-black/30 transition-all duration-300`}>
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
                <Card className={`overflow-hidden ${style.cardBg} backdrop-blur ${style.border} hover:bg-black/30 transition-all duration-300`}>
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
                <Card className={`overflow-hidden ${style.cardBg} backdrop-blur ${style.border} hover:bg-black/30 transition-all duration-300`}>
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
              className={`w-full h-14 text-lg rounded-full bg-gradient-to-r ${style.button} hover:brightness-110 transition-all duration-300 shadow-lg shadow-current/20 hover:shadow-xl hover:shadow-current/30 font-bold tracking-wide text-white`}
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