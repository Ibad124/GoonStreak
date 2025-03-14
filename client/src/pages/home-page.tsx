import { useState } from "react";
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
import { Loader2, Menu, Film, Trophy, Star, Flame, Clock, Users, Target, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Challenges from "@/components/Challenges";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { GoonRoom } from "@/components/GoonRoom";

const themeStyles = {
  default: {
    background: "from-zinc-50 to-blue-50",
    headerBg: "bg-white/80",
    cardBg: "bg-white/80",
    text: "text-zinc-900",
    accent: "text-blue-500",
    button: "from-blue-500 to-blue-600",
    border: "border-zinc-200/50",
    greeting: "Ready to conquer today? 🌟"
  },
  solo: {
    background: "from-slate-900 to-zinc-900",
    headerBg: "bg-black/20",
    cardBg: "bg-black/20",
    text: "text-zinc-100",
    accent: "text-emerald-500",
    button: "from-emerald-500 to-emerald-600",
    border: "border-white/10",
    greeting: "SYSTEMS ONLINE. READY FOR TRAINING. 🤖"
  },
  competitive: {
    background: "from-purple-900 to-pink-900",
    headerBg: "bg-black/20",
    cardBg: "bg-black/20",
    text: "text-pink-100",
    accent: "text-pink-500",
    button: "from-pink-500 to-purple-500",
    border: "border-white/10",
    greeting: "Time to crush those goals! 🔥"
  },
  hardcore: {
    background: "from-red-950 to-black",
    headerBg: "bg-black/20",
    cardBg: "bg-black/20",
    text: "text-red-100",
    accent: "text-red-500",
    button: "from-red-500 to-red-600",
    border: "border-white/10",
    greeting: "Embrace the darkness within... 😈"
  }
};

const characterMessages = {
  solo: {
    sessionLogged: "STREAK RECORDED. POWER LEVEL INCREASING... 🤖",
    levelUp: "SYSTEM UPGRADE COMPLETE. NEW RANK ACHIEVED: ",
    xpGained: "EXPERIENCE POINTS ACQUIRED: ",
    timeMessage: {
      morning: "OPTIMAL PERFORMANCE WINDOW DETECTED",
      afternoon: "PEAK EFFICIENCY TIME APPROACHING",
      night: "DARK MODE OPERATIONS ENGAGED"
    }
  },
  competitive: {
    sessionLogged: "Great job, superstar! Keep that momentum going! 💖",
    levelUp: "OMG! You just leveled up to ",
    xpGained: "You earned ",
    timeMessage: {
      morning: "Rise and shine, champion!",
      afternoon: "Peak performance time!",
      night: "Night mode activated!"
    }
  },
  hardcore: {
    sessionLogged: "Your dedication pleases me... Your streak grows stronger. 😈",
    levelUp: "Your power rises... You have ascended to ",
    xpGained: "Dark energy acquired: ",
    timeMessage: {
      morning: "The dawn brings new power...",
      afternoon: "Your strength peaks...",
      night: "Darkness empowers you..."
    }
  },
  default: {
    sessionLogged: "Session logged successfully! ✨",
    levelUp: "Level up! You're now ",
    xpGained: "XP gained: ",
    timeMessage: {
      morning: "Good morning!",
      afternoon: "Good afternoon!",
      evening: "Good evening!"
    }
  }
};

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const { preferences } = useTheme();
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isGoonRoomOpen, setIsGoonRoomOpen] = useState(false);

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["/api/stats"],
  });

  // If not authenticated, return early
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // If there's an error, show error state
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

  const messages = characterMessages[preferences.goonStyle] || characterMessages.default;
  const style = themeStyles[preferences.goonStyle] || themeStyles.default;

  const sessionMutation = useMutation({
    mutationFn: async (sessionData) => {
      const res = await apiRequest("POST", "/api/session", sessionData);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });

      const showToastSequence = async () => {
        toast({
          title: "Session Logged",
          description: messages.sessionLogged,
          variant: "default",
        });

        await new Promise(resolve => setTimeout(resolve, 500));

        const xpGained = data.user.xpPoints - (stats?.user.xpPoints || 0);
        toast({
          title: "XP Gained!",
          description: `${messages.xpGained}+${xpGained} XP`,
          variant: "default",
        });

        if (data.leveledUp) {
          await new Promise(resolve => setTimeout(resolve, 500));
          toast({
            title: "Level Up!",
            description: `${messages.levelUp}${data.user.title}!`,
            variant: "default",
          });
        }

        data.newAchievements?.forEach((achievement, index) => {
          setTimeout(() => {
            toast({
              title: "Achievement Unlocked!",
              description: achievement.description,
              variant: "default",
            });
          }, 500 * (index + 1));
        });
      };

      showToastSequence();
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

  const getTimeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return messages.timeMessage.morning;
    if (hour < 18) return messages.timeMessage.afternoon;
    return messages.timeMessage.night;
  };

  return (
    <>
      <div className={`min-h-screen pb-20 relative overflow-hidden bg-gradient-to-br ${style.background}`}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwbDIwLTIwTTAgNDBsMjAtMjBNMTAgNTBsMjAtMjAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIiBzdHJva2Utd2lkdGg9IjIiLz48L3BhdHRlcm4+PC9kZWZzPjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik0wIDBoMjAwdjIwMEgweiIvPjwvc3ZnPg==')]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className={`fixed top-0 left-0 right-0 ${style.headerBg} backdrop-blur-lg z-50 border-b ${style.border}`}
        >
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1"
              >
                <Star className={`h-5 w-5 ${style.accent}`} />
                <span className={`font-bold tracking-tight text-lg md:text-xl truncate bg-gradient-to-r ${style.button} text-transparent bg-clip-text`}>
                  {user?.username}
                </span>
              </motion.div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className={`${style.text} text-sm md:text-base`}
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
                  <Link href="/social">
                    <Button
                      variant="outline"
                      className={`w-full rounded-full flex items-center justify-start gap-3 bg-white/5 ${style.border} ${style.text} hover:bg-white/10`}
                    >
                      <Users className="h-4 w-4" />
                      Social Hub
                    </Button>
                  </Link>
                  <Link href="/adult-content">
                    <Button
                      variant="outline"
                      className={`w-full rounded-full flex items-center justify-start gap-3 bg-white/5 ${style.border} ${style.text} hover:bg-white/10`}
                    >
                      <Film className="h-4 w-4" />
                      Adult Content
                    </Button>
                  </Link>
                  <Link href="/leaderboard">
                    <Button
                      variant="outline"
                      className={`w-full rounded-full flex items-center justify-start gap-3 bg-white/5 ${style.border} ${style.text} hover:bg-white/10`}
                    >
                      <Trophy className="h-4 w-4" />
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-4 pt-24 pb-6"
        >
          <div className={`${style.cardBg} backdrop-blur rounded-2xl p-6 md:p-8 ${style.border} hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01]`}>
            <div className="flex items-start md:items-center gap-4 flex-col md:flex-row">
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${style.button} shadow-lg relative overflow-hidden group`}>
                <Clock className="h-6 w-6 md:h-8 md:w-8 text-white relative z-10" />
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </div>
              <div className="flex-1 min-w-0">
                <motion.h2
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className={`text-xl md:text-3xl font-bold ${style.text} mb-2`}
                >
                  {getTimeMessage()}
                </motion.h2>
                <motion.p
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className={`${style.text} opacity-80 text-sm md:text-base`}
                >
                  {style.greeting}
                </motion.p>
              </div>
            </div>
          </div>
        </motion.div>

        <main className="container mx-auto px-4 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
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
                <Card className={`overflow-hidden ${style.cardBg} backdrop-blur ${style.border} hover:bg-black/30 transition-all duration-300 transform hover:scale-[1.02]`}>
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

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className={`overflow-hidden ${style.cardBg} backdrop-blur ${style.border} hover:bg-black/30 transition-all duration-300 transform hover:scale-[1.02]`}>
                  <CardHeader>
                    <CardTitle className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${style.text}`}>
                      <Clock className={`${style.accent}`} />
                      Power Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-lg ${style.text}`}>
                      {preferences.timePreference === "morning" && "Early Bird 🌅"}
                      {preferences.timePreference === "afternoon" && "Midday Warrior ☀️"}
                      {preferences.timePreference === "night" && "Night Owl 🌙"}
                    </div>
                    <p className={`${style.text} opacity-80 mt-2`}>
                      Your optimal performance time
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Card className={`overflow-hidden ${style.cardBg} backdrop-blur ${style.border} hover:bg-black/30 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer`}
                  onClick={() => setIsGoonRoomOpen(true)}
                >
                  <CardHeader>
                    <CardTitle className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${style.text}`}>
                      <Users className={`${style.accent}`} />
                      Live Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`${style.text} opacity-80`}>
                      {preferences.socialMode === "solo"
                        ? "Join a private training session"
                        : preferences.socialMode === "competitive"
                        ? "Compete in live challenges!"
                        : "Enter the darkness together..."}
                    </p>
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
                <Card className={`overflow-hidden ${style.cardBg} backdrop-blur ${style.border} hover:bg-black/30 transition-all duration-300 transform hover:scale-[1.02]`}>
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

              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Card className={`overflow-hidden ${style.cardBg} backdrop-blur ${style.border} hover:bg-black/30 transition-all duration-300 transform hover:scale-[1.02]`}>
                  <CardHeader>
                    <CardTitle className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${style.text}`}>
                      <Trophy className={`${style.accent}`} />
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

              {preferences.socialMode !== "solo" && (
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className={`overflow-hidden ${style.cardBg} backdrop-blur ${style.border} hover:bg-black/30 transition-all duration-300 transform hover:scale-[1.02]`}>
                    <CardHeader>
                      <CardTitle className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${style.text}`}>
                        <Users className={`${style.accent}`} />
                        {preferences.socialMode === "friends" ? "Friend Activity" : "Global Leaders"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className={`${style.text} opacity-80`}>
                        {preferences.socialMode === "friends"
                          ? "Stay motivated with your friends!"
                          : "Compete with the best worldwide!"}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </main>

        <LogSessionModal
          isOpen={isSessionModalOpen}
          onClose={() => setIsSessionModalOpen(false)}
          onSubmit={(data) => sessionMutation.mutate(data)}
          isPending={sessionMutation.isPending}
        />

        <GoonRoom
          isOpen={isGoonRoomOpen}
          onClose={() => setIsGoonRoomOpen(false)}
        />

        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className={`fixed bottom-0 left-0 right-0 p-4 ${style.headerBg} backdrop-blur ${style.border}`}
        >
          <div className="container mx-auto max-w-lg">
            <Button
              className={`
                w-full h-12 md:h-14 text-base md:text-lg rounded-full 
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
                <Sparkles className="h-5 w-5 md:h-6 md:w-6" />
                <span className="relative">
                  {preferences.goonStyle === "solo" ? "LOG TRAINING SESSION" :
                    preferences.goonStyle === "competitive" ? "Record Your Victory!" :
                      preferences.goonStyle === "hardcore" ? "Embrace The Darkness..." :
                        "Log Session"}
                </span>
              </motion.div>
              <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </Button>
          </div>
        </motion.div>
      </div>
    </>
  );
}