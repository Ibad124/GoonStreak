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
import { Loader2, Menu, Sparkles, Trophy, Star } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Challenges from "@/components/Challenges";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  console.log('Stats data:', stats);

  const sessionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/session");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });

      // Show basic session completion toast
      toast({
        title: "Session Logged",
        description: "Your streak has been updated!",
      });

      // Show XP gained toast
      const xpGained = data.user.xpPoints - (stats?.user.xpPoints || 0);
      toast({
        title: "XP Gained!",
        description: `+${xpGained} XP`,
        icon: <Star className="h-5 w-5 text-yellow-500" />,
      });

      // If user leveled up, show special toast
      if (data.leveledUp) {
        toast({
          title: "Level Up!",
          description: `Congratulations! You're now ${data.user.title}!`,
          icon: <Sparkles className="h-5 w-5 text-yellow-500" />,
        });
      }

      // If new achievements were earned, show them
      data.newAchievements?.forEach(achievement => {
        toast({
          title: "Achievement Unlocked!",
          description: achievement.description,
          icon: <Trophy className="h-5 w-5 text-purple-500" />,
        });
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-zinc-50/50 backdrop-blur">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 z-50 border-b border-zinc-200/50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">Hi, {user?.username}!</h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="space-y-4 mt-8">
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
      <main className="container mx-auto px-4 pt-20">
        <div className="space-y-6">
          {/* XP Progress */}
          <XPProgress 
            user={stats.user} 
            nextLevelXP={stats.nextLevelXP}
            currentLevelXP={stats.currentLevelXP}
          />

          {/* Challenges Section */}
          <Card className="backdrop-blur bg-white/80 border-zinc-200/50 shadow-lg shadow-zinc-100/50">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold tracking-tight">Daily Challenges</CardTitle>
            </CardHeader>
            <CardContent>
              <Challenges challenges={stats?.challenges || []} />
            </CardContent>
          </Card>

          {/* Streak Stats */}
          <Card className="backdrop-blur bg-white/80 border-zinc-200/50 shadow-lg shadow-zinc-100/50">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold tracking-tight">Your Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <StreakStats stats={stats} />
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="backdrop-blur bg-white/80 border-zinc-200/50 shadow-lg shadow-zinc-100/50">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold tracking-tight">Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <Achievements achievements={stats?.achievements || []} />
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Fixed Bottom Bar with Log Session Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-t border-zinc-200/50">
        <div className="container mx-auto max-w-lg">
          <Button
            className="w-full h-14 text-lg rounded-full bg-blue-500 hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
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
      </div>
    </div>
  );
}