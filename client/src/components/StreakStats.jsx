import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, Trophy, Zap } from "lucide-react";

function StatCard({ icon, value, label }) {
  return (
    <Card className="p-4 flex flex-col items-center bg-white/50 backdrop-blur border-zinc-200/50">
      <div className="mb-2">{icon}</div>
      <div className="text-3xl font-semibold tracking-tight">{value}</div>
      <div className="text-sm text-zinc-500 font-medium">{label}</div>
    </Card>
  );
}

export default function StreakStats({ stats }) {
  const { currentStreak, longestStreak, totalSessions, todaySessions } = stats.user;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={<Zap className="h-8 w-8 text-amber-500/90" />}
          value={currentStreak}
          label="Current Streak"
        />
        <StatCard
          icon={<Trophy className="h-8 w-8 text-blue-500/90" />}
          value={longestStreak}
          label="Best Streak"
        />
        <StatCard
          icon={<Star className="h-8 w-8 text-purple-500/90" />}
          value={totalSessions}
          label="Total Sessions"
        />
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-zinc-700">Today's Sessions</span>
          <span className="text-sm text-zinc-500 font-medium">{todaySessions}</span>
        </div>
        <Progress 
          value={(todaySessions / 5) * 100} 
          className="h-2 bg-zinc-100"
        />
      </div>
    </div>
  );
}
