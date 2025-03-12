import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, Trophy, Zap } from "lucide-react";

interface StatsProps {
  stats: {
    user: {
      currentStreak: number;
      longestStreak: number;
      totalSessions: number;
      todaySessions: number;
    };
  };
}

export default function StreakStats({ stats }: StatsProps) {
  const { currentStreak, longestStreak, totalSessions, todaySessions } = stats.user;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 flex flex-col items-center">
          <Zap className="h-8 w-8 text-yellow-500 mb-2" />
          <div className="text-2xl font-bold">{currentStreak}</div>
          <div className="text-sm text-muted-foreground">Current Streak</div>
        </Card>

        <Card className="p-4 flex flex-col items-center">
          <Trophy className="h-8 w-8 text-blue-500 mb-2" />
          <div className="text-2xl font-bold">{longestStreak}</div>
          <div className="text-sm text-muted-foreground">Longest Streak</div>
        </Card>

        <Card className="p-4 flex flex-col items-center">
          <Star className="h-8 w-8 text-purple-500 mb-2" />
          <div className="text-2xl font-bold">{totalSessions}</div>
          <div className="text-sm text-muted-foreground">Total Sessions</div>
        </Card>
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Today's Sessions</span>
          <span className="text-sm text-muted-foreground">{todaySessions}</span>
        </div>
        <Progress value={(todaySessions / 5) * 100} className="h-2" />
      </div>
    </div>
  );
}
