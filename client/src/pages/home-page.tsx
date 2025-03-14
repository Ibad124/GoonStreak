import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Film, Trophy, Star, Flame, Clock, Users, Target, Sparkles } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import StreakStats from "@/components/StreakStats";
import Achievements from "@/components/Achievements";
import LevelProgress from "@/components/LevelProgress";
import LogSessionModal from "@/components/LogSessionModal";
import Challenges from "@/components/Challenges";
import { GoonRoom } from "@/components/GoonRoom";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.3
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
      stiffness: 100,
      damping: 15
    }
  }
};

const themeStyles = {
  default: {
    background: "from-indigo-900 via-purple-900 to-violet-900",
    headerBg: "bg-black/40",
    cardBg: "bg-black/40",
    text: "text-white",
    accent: "text-purple-400",
    button: "from-purple-500 to-violet-600",
    border: "border-white/10",
    greeting: "Track your progress, build momentum, and unlock your full potential.",
    subGreeting: "with our elegant tracking system."
  },
  solo: {
    background: "from-slate-900 via-cyan-900 to-blue-900",
    headerBg: "bg-black/40",
    cardBg: "bg-black/40",
    text: "text-cyan-50",
    accent: "text-cyan-400",
    button: "from-cyan-600 to-blue-600",
    border: "border-white/10",
    greeting: "SYSTEMS ONLINE. READY FOR TRAINING. 🤖"
  },
  competitive: {
    background: "from-rose-900 via-pink-900 to-fuchsia-900",
    headerBg: "bg-black/40",
    cardBg: "bg-black/40",
    text: "text-pink-50",
    accent: "text-pink-400",
    button: "from-rose-600 to-pink-600",
    border: "border-white/10",
    greeting: "Time to crush those goals! 🔥"
  },
  hardcore: {
    background: "from-red-950 via-purple-950 to-black",
    headerBg: "bg-black/40",
    cardBg: "bg-black/40",
    text: "text-red-50",
    accent: "text-red-400",
    button: "from-red-600 to-purple-600",
    border: "border-white/10",
    greeting: "Embrace the darkness within... 😈"
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

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
        <p className="text-muted-foreground">Checking authentication...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Card className="w-[90%] max-w-md">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-destructive mb-2">Unable to load data</h2>
            <p className="text-sm text-muted-foreground">Please try logging in again.</p>
            <Button className="mt-4 w-full" asChild>
              <Link href="/auth">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
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
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setIsSessionModalOpen(false);
      toast({
        title: "Session Logged!",
        description: "Great work! Keep up the momentum!",
        variant: "default",
      });
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
      <div className={`min-h-screen relative bg-gradient-to-br ${style.background}`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            className="absolute inset-0 opacity-30"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0],
            }}
            transition={{ duration: 20, repeat: Infinity }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
          </motion.div>
        </div>

        {/* Header */}
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className={`fixed top-0 left-0 right-0 ${style.headerBg} backdrop-blur-xl z-50 border-b ${style.border}`}
        >
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2"
              >
                <Star className={`h-5 w-5 ${style.accent}`} />
                <span className="text-xl font-bold">QuantumFlow</span>
              </motion.div>
            </div>

            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2"
              >
                <Button variant="ghost" size="icon">
                  <Menu className={`h-5 w-5 ${style.text}`} />
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <motion.main
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto px-4 pt-24 pb-20"
        >
          {/* Hero Section */}
          <motion.div variants={itemVariants}>
            <div className="text-center mb-12">
              <motion.h1 
                variants={itemVariants}
                className="text-4xl md:text-5xl font-bold text-white mb-4"
              >
                Elevate Your Daily Practice
              </motion.h1>
              <motion.p
                variants={itemVariants}
                transition={{ delay: 0.1 }}
                className="text-lg text-purple-200/80"
              >
                {style.greeting} {style.subGreeting}
              </motion.p>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <motion.div
              variants={itemVariants}
              transition={{ delay: 0.2 }}
              className={`p-6 rounded-2xl ${style.cardBg} backdrop-blur border ${style.border}`}
            >
              <div className="text-sm text-purple-300 mb-2">Current Streak</div>
              <div className="text-3xl font-bold text-white mb-1">
                {stats?.user?.currentStreak || 0} days
              </div>
              <div className="text-sm text-purple-300">
                +3 from last week
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              transition={{ delay: 0.3 }}
              className={`p-6 rounded-2xl ${style.cardBg} backdrop-blur border ${style.border}`}
            >
              <div className="text-sm text-purple-300 mb-2">Total Practice</div>
              <div className="text-3xl font-bold text-white mb-1">
                {stats?.totalHours || 39} hours
              </div>
              <div className="text-sm text-purple-300">
                {stats?.todayMinutes || 39} minutes today
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              transition={{ delay: 0.4 }}
              className={`p-6 rounded-2xl ${style.cardBg} backdrop-blur border ${style.border}`}
            >
              <div className="text-sm text-purple-300 mb-2">Level Progress</div>
              <div className="text-3xl font-bold text-white mb-1">
                {Math.round((stats?.currentLevelXP / stats?.nextLevelXP) * 100)}%
              </div>
              <div className="text-sm text-purple-300">
                {stats?.currentLevelXP || 7450}/{stats?.nextLevelXP || 10000} XP
              </div>
            </motion.div>
          </motion.div>

          {/* Daily Challenges */}
          <motion.div
            variants={itemVariants}
            transition={{ delay: 0.5 }}
            className={`p-6 rounded-2xl ${style.cardBg} backdrop-blur border ${style.border} mb-12`}
          >
            <h2 className="text-xl font-bold text-white mb-6">Daily Challenges</h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm text-purple-300 mb-2">
                  <span>7-Day Challenge</span>
                  <span>5/7</span>
                </div>
                <div className="h-2 bg-purple-900 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '71%' }} />
                </div>
                <div className="text-sm text-purple-300 mt-2">
                  Complete at least 15 minutes of practice each day for 7 days straight.
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm text-purple-300 mb-2">
                  <span>Power Hour</span>
                  <span>45/60</span>
                </div>
                <div className="h-2 bg-purple-900 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '75%' }} />
                </div>
                <div className="text-sm text-purple-300 mt-2">
                  Complete a full 60-minute session without interruptions.
                </div>
              </div>
            </div>
          </motion.div>

          {/* Streak Calendar */}
          <motion.div
            variants={itemVariants}
            transition={{ delay: 0.6 }}
            className={`p-6 rounded-2xl ${style.cardBg} backdrop-blur border ${style.border}`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Streak Calendar</h2>
              <div className="flex gap-2 text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" /> Active
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-900" /> Inactive
                </span>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-lg ${
                    Math.random() > 0.3 ? 'bg-purple-500' : 'bg-purple-900'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </motion.main>

        {/* Action Button */}
        <motion.div
          variants={itemVariants}
          className="fixed bottom-6 left-0 right-0 flex justify-center"
        >
          <Button
            className={`
              h-14 px-8 rounded-full text-lg font-medium
              bg-gradient-to-r from-purple-500 to-violet-600
              hover:from-purple-600 hover:to-violet-700
              transition-all duration-300
              shadow-lg shadow-purple-900/50
              flex items-center gap-2
            `}
            onClick={() => setIsSessionModalOpen(true)}
          >
            <Sparkles className="h-5 w-5" />
            Start New Session
          </Button>
        </motion.div>

        {/* Modals */}
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
      </div>
    </>
  );
}