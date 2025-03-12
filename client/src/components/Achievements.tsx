import { type Achievement } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Medal, Star, Trophy, Award } from "lucide-react";

const ACHIEVEMENT_ICONS: Record<string, React.ReactNode> = {
  STREAK_3: <Trophy className="h-6 w-6 text-yellow-500" />,
  STREAK_7: <Medal className="h-6 w-6 text-blue-500" />,
  SESSIONS_10: <Star className="h-6 w-6 text-purple-500" />,
  DEFAULT: <Award className="h-6 w-6 text-gray-500" />,
};

interface AchievementsProps {
  achievements: Achievement[];
}

export default function Achievements({ achievements }: AchievementsProps) {
  if (achievements.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No achievements yet. Keep going!
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {achievements.map((achievement) => (
        <Card key={achievement.id} className="p-4 flex items-center gap-4">
          {ACHIEVEMENT_ICONS[achievement.type] || ACHIEVEMENT_ICONS.DEFAULT}
          <div>
            <div className="font-medium">{achievement.description}</div>
            <div className="text-sm text-muted-foreground">
              Earned on {new Date(achievement.earnedAt).toLocaleDateString()}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
