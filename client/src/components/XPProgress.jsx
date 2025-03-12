import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, Trophy, Sparkles } from "lucide-react";

export default function XPProgress({ user, nextLevelXP, currentLevelXP }) {
  // Calculate XP progress percentage
  const progressInCurrentLevel = user.xpPoints - currentLevelXP;
  const xpNeededForNextLevel = nextLevelXP - currentLevelXP;
  const xpProgress = Math.min(100, Math.max(0, (progressInCurrentLevel / xpNeededForNextLevel) * 100));

  return (
    <Card className="p-4 backdrop-blur bg-white/80 border-zinc-200/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500/90" />
          <span className="font-semibold tracking-tight">{user.title}</span>
        </div>
        <span className="text-sm text-zinc-500">Level {user.level}</span>
      </div>

      <div className="mt-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-zinc-500">XP Progress</span>
          <span className="text-sm font-medium">{user.xpPoints} / {nextLevelXP}</span>
        </div>
        <Progress 
          value={xpProgress} 
          className="h-2 bg-zinc-100"
        />
      </div>

      <div className="mt-4 text-sm text-zinc-500">
        {nextLevelXP - user.xpPoints} XP needed for next level
      </div>
    </Card>
  );
}