import { type Achievement } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Medal, Star, Trophy, Award, Target, Flame } from "lucide-react";
import { motion } from "framer-motion";

const ACHIEVEMENT_ICONS: Record<string, React.ReactNode> = {
  STREAK_3: <Trophy className="h-6 w-6 text-yellow-500" />,
  STREAK_7: <Medal className="h-6 w-6 text-blue-500" />,
  STREAK_14: <Flame className="h-6 w-6 text-orange-500" />,
  STREAK_30: <Trophy className="h-6 w-6 text-purple-500" />,
  STREAK_100: <Star className="h-6 w-6 text-pink-500" />,
  SESSIONS_10: <Target className="h-6 w-6 text-green-500" />,
  LEVEL_UP: <Star className="h-6 w-6 text-yellow-500" />,
  DEFAULT: <Award className="h-6 w-6 text-gray-500" />,
};

const ACHIEVEMENT_GOALS: Record<string, number> = {
  STREAK_3: 3,
  STREAK_7: 7,
  STREAK_14: 14,
  STREAK_30: 30,
  STREAK_100: 100,
  SESSIONS_10: 10,
};

interface AchievementsProps {
  achievements: Achievement[];
  stats: {
    currentStreak: number;
    totalSessions: number;
  };
}

export default function Achievements({ achievements, stats }: AchievementsProps) {
  const calculateProgress = (type: string) => {
    switch (true) {
      case type.startsWith('STREAK_'):
        const streakGoal = ACHIEVEMENT_GOALS[type] || 0;
        return Math.min(100, (stats.currentStreak / streakGoal) * 100);
      case type.startsWith('SESSIONS_'):
        const sessionGoal = ACHIEVEMENT_GOALS[type] || 0;
        return Math.min(100, (stats.totalSessions / sessionGoal) * 100);
      default:
        return 0;
    }
  };

  const isUnlocked = (type: string) => {
    return achievements.some(a => a.type === type);
  };

  const renderAchievementCard = (type: string, description: string) => {
    const unlocked = isUnlocked(type);
    const progress = calculateProgress(type);

    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.02 }}
        className="relative"
      >
        <Card className={`p-4 ${unlocked ? 'bg-white/80' : 'bg-gray-50/80'} backdrop-blur border-zinc-200/50 transition-all duration-300`}>
          <div className="flex items-start gap-4">
            <div className={`${unlocked ? '' : 'opacity-50'}`}>
              {ACHIEVEMENT_ICONS[type] || ACHIEVEMENT_ICONS.DEFAULT}
            </div>
            <div className="flex-1">
              <div className="font-medium">{description}</div>
              {!unlocked && (
                <div className="mt-2 space-y-2">
                  <Progress value={progress} className="h-2" />
                  <div className="text-sm text-muted-foreground">
                    Progress: {Math.round(progress)}%
                  </div>
                </div>
              )}
              {unlocked && (
                <div className="text-sm text-green-600 font-medium mt-1">
                  ✓ Unlocked
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {renderAchievementCard("STREAK_3", "Maintain a 3-day streak")}
        {renderAchievementCard("STREAK_7", "Reach a 7-day streak milestone")}
        {renderAchievementCard("STREAK_14", "Achieve a 14-day streak")}
        {renderAchievementCard("STREAK_30", "Master a 30-day streak")}
        {renderAchievementCard("STREAK_100", "Legendary 100-day streak")}
        {renderAchievementCard("SESSIONS_10", "Complete 10 sessions")}
      </div>

      {/* Level-up and special achievements */}
      {achievements.filter(a => a.type === "LEVEL_UP").map((achievement) => (
        <motion.div
          key={achievement.id}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200/50">
            <div className="flex items-center gap-4">
              <Star className="h-6 w-6 text-yellow-500" />
              <div>
                <div className="font-medium">{achievement.description}</div>
                <div className="text-sm text-blue-600">
                  {new Date(achievement.earnedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}