import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StreakStats from "@/components/StreakStats";
import Achievements from "@/components/Achievements";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Menu, Film, Users } from "lucide-react"; 
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Challenges from "@/components/Challenges";
import { motion } from "framer-motion";
import FriendsList from "@/components/FriendsList";
import LogSessionModal from '@/components/LogSessionModal';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  const sessionMutation = useMutation({
    mutationFn: async (sessionData) => {
      try {
        const res = await apiRequest("POST", "/api/session", sessionData);
        return await res.json();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to log session. Please try again.",
          variant: "destructive",
        });
        throw error;
      }
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
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to log session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSessionSubmit = async (sessionData) => {
    sessionMutation.mutate(sessionData);
    setIsSessionModalOpen(false);
  };

  if (isStatsLoading || !stats) {
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
                <Link href="/social">
                  <Button
                    variant="outline"
                    className="w-full rounded-full flex items-center"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Social Hub
                  </Button>
                </Link>
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

      <div className="container mx-auto px-4">
        <div className="flex min-h-screen pt-24 pb-32 gap-6">
          <div className="flex-1 space-y-6">
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

            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
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

            <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
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

          <div className="hidden lg:block w-96">
            <div className="sticky top-24">
              <FriendsList />
            </div>
          </div>
        </div>
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
            ) : null}
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