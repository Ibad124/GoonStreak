import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, Crown, Trophy, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import { LEVEL_THRESHOLDS } from "@shared/schema";
import { calculateLevel } from "@/lib/utils";

interface LevelProgressProps {
  user: {
    xpPoints: number;
    level: number;
  };
}

export default function LevelProgress({ user }: LevelProgressProps) {
  const levelInfo = calculateLevel(user.xpPoints);
  const nextTitle = LEVEL_THRESHOLDS[(user.level + 1) as keyof typeof LEVEL_THRESHOLDS]?.title || "Max Level";
  const progress = (levelInfo.progress / levelInfo.total) * 100;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="space-y-6"
    >
      <Card className="overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 text-white">
        <div className="relative">
          <motion.div
            className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwbDIwLTIwTTAgNDBsMjAtMjBNMTAgNTBsMjAtMjAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIiBzdHJva2Utd2lkdGg9IjIiLz48L3BhdHRlcm4+PC9kZWZzPjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik0wIDBoMjAwdjIwMEgweiIvPjwvc3ZnPg==')]"
            animate={{
              opacity: [0.1, 0.15, 0.1],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <div className="p-6 relative z-10">
            {/* Current Level Info */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Crown className="h-6 w-6 text-yellow-300" />
                <h2 className="text-xl font-semibold">Level {levelInfo.currentLevel}</h2>
              </div>
              <p className="text-3xl font-bold mb-4">
                {levelInfo.currentEmoji} {levelInfo.currentTitle}
              </p>
            </div>

            {/* Progress Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ChevronUp className="h-5 w-5 text-pink-300" />
                  <span className="font-medium">Progress to {nextTitle}</span>
                </div>
                <span className="text-sm text-pink-200">{Math.round(progress)}%</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-pink-200">
                  <span>{levelInfo.progress} XP</span>
                  <span>{levelInfo.total} XP</span>
                </div>
                <div className="relative h-3 bg-black/20 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-pink-300 to-purple-300"
                    style={{ width: `${progress}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </div>
                <div className="text-center text-sm text-pink-200 font-medium">
                  {Math.round(levelInfo.nextLevelXP - user.xpPoints)} XP until next level
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}