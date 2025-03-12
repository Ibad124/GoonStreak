import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StreakStats from "@/components/StreakStats";
import Achievements from "@/components/Achievements";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Menu, Film, Users, Trophy, Activity, PlusCircle } from "lucide-react";
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
    description: "Connect with friends and start circle sessions",
    color: "bg-purple-500"
  },
  {
    title: "Adult Content",
    icon: Film,
    href: "/adult-content",
    description: "Access premium adult content",
    color: "bg-pink-500"
  },
  {
    title: "Leaderboard",
    icon: Trophy,
    href: "/leaderboard",
    description: "See how you rank against others",
    color: "bg-yellow-500"
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

  // Add back the handleSessionSubmit function
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
              <Button variant="outline" size="icon" className="rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:w-[400px] p-0">
              <SheetHeader className="p-6 bg-gradient-to-b from-blue-500 to-blue-600 text-white">
                <SheetTitle className="text-2xl font-bold text-white">Menu</SheetTitle>
              </SheetHeader>
              <div className="p-6 space-y-6">
                <div className="grid gap-4">
                  {menuItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant="outline"
                        className="w-full h-auto p-4 flex flex-col items-start gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <div className={`${item.color} p-2 rounded-lg`}>
                          <item.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold">{item.title}</div>
                          <div className="text-sm text-muted-foreground">{item.description}</div>
                        </div>
                      </Button>
                    </Link>
                  ))}
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