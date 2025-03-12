import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StreakStats from "@/components/StreakStats";
import Achievements from "@/components/Achievements";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Film } from "lucide-react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      // Mock stats data for now
      return {
        user: {
          currentStreak: 5,
          longestStreak: 10,
          totalSessions: 25,
        },
        achievements: [],
      };
    },
  });

  const sessionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/session");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Session Logged",
        description: "Your streak has been updated!",
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
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Welcome, {user?.username}!</h1>
        <div className="space-x-4">
          <Link href="/adult">
            <Button variant="outline" className="gap-2">
              <Film className="h-4 w-4" />
              Adult Content
            </Button>
          </Link>
          <Link href="/leaderboard">
            <Button variant="outline">Leaderboard</Button>
          </Link>
          <Button variant="destructive" onClick={() => logoutMutation.mutate()}>
            Logout
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Track Your Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <StreakStats stats={stats} />
            <Button
              className="w-full mt-4"
              size="lg"
              onClick={() => sessionMutation.mutate()}
              disabled={sessionMutation.isPending}
            >
              {sessionMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Log Session
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <Achievements achievements={stats?.achievements || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
