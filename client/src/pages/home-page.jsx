import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StreakStats from "@/components/StreakStats";
import Achievements from "@/components/Achievements";
import XPProgress from "@/components/XPProgress";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Menu, Film, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Challenges from "@/components/Challenges";
import SessionInsights from "@/components/SessionInsights";
import { motion } from "framer-motion";
import FriendsList from "@/components/FriendsList";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  const sessionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/session");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });

      toast({
        title: "Session Logged",
        description: "Your streak has been updated!",
      });

      const xpGained = data.user.xpPoints - (stats?.user.xpPoints || 0);
      toast({
        title: "XP Gained!",
        description: `+${xpGained} XP`,
        variant: "default",
      });

      if (data.leveledUp) {
        toast({
          title: "Level Up!",
          description: `Congratulations! You're now ${data.user.title}!`,
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
    },
  });

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-blue-50/50 to-white">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 z-50 border-b border-zinc-200/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <motion.h1 
            className="text-xl font-semibold tracking-tight bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
            {...fadeInUp}
          >
            Hi, {user?.username}!
          </motion.h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="space-y-4 mt-8">
                <Link href="/adult-content">
                  <Button
                    variant="outline"
                    className="w-full rounded-full flex items-center"
                  >
                    <Film className="h-4 w-4 mr-2" />
                    Adult Content
                  </Button>
                </Link>
                <Link href="/leaderboard">
                  <Button variant="outline" className="w-full rounded-full">
                    Leaderboard
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  className="w-full rounded-full"
                  onClick={() => logoutMutation.mutate()}
                >
                  Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Progress Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* XP Progress */}
            <motion.div {...fadeInUp}>
              {stats && (
                <XPProgress
                  user={stats.user}
                  nextLevelXP={stats.nextLevelXP}
                  currentLevelXP={stats.currentLevelXP}
                />
              )}
            </motion.div>

            {/* Challenges Section */}
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
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

            {/* Streak Stats */}
            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <Card className="overflow-hidden backdrop-blur bg-white/80 border-zinc-200/50 shadow-lg shadow-blue-900/5">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold tracking-tight">
                    Your Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <StreakStats stats={{ user: stats.user }} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Session Insights */}
            <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
              <Card className="overflow-hidden backdrop-blur bg-white/80 border-zinc-200/50 shadow-lg shadow-blue-900/5">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold tracking-tight">
                    Session Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SessionInsights />
                </CardContent>
              </Card>
            </motion.div>

            {/* Achievements */}
            <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
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
          </div>

          {/* Friends Column */}
          <motion.div 
            {...fadeInUp} 
            transition={{ delay: 0.5 }}
            className="lg:col-span-1 space-y-6"
          >
            <FriendsList />
          </motion.div>
        </div>
      </main>

      {/* Fixed Bottom Bar with Log Session Button */}
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
            onClick={() => sessionMutation.mutate()}
            disabled={sessionMutation.isPending}
          >
            {sessionMutation.isPending ? (
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
            ) : null}
            Log Session
          </Button>
        </div>
      </motion.div>
    </div>
  );
}