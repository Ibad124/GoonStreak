import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, Crown, Trophy, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import { LEVEL_THRESHOLDS } from "@shared/schema";

interface LevelProgressProps {
  user: {
    xpPoints: number;
    level: number;
    title: string;
  };
  nextLevelXP: number;
  currentLevelXP: number;
}

export default function LevelProgress({ user, nextLevelXP, currentLevelXP }: LevelProgressProps) {
  const progress = ((user.xpPoints - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  const nextTitle = LEVEL_THRESHOLDS[(user.level + 1) as keyof typeof LEVEL_THRESHOLDS]?.title || "Max Level";

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="space-y-6"
    >
      {/* Current Level Card */}
      <Card className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white overflow-hidden relative">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="h-6 w-6 text-yellow-300" />
            <h2 className="text-xl font-semibold">Level {user.level}</h2>
          </div>
          <p className="text-2xl font-bold mb-4">{user.title}</p>
          <div className="flex items-center gap-2 text-sm text-blue-100">
            <Star className="h-4 w-4" />
            <span>{user.xpPoints} XP Total</span>
          </div>
        </div>
        <motion.div
          className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </Card>

      {/* Progress to Next Level */}
      <Card className="p-6 bg-white/80 backdrop-blur border-zinc-200/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ChevronUp className="h-5 w-5 text-blue-500" />
            <span className="font-medium">Next Level</span>
          </div>
          <span className="text-sm text-zinc-500">{nextTitle}</span>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-zinc-600">
            <span>{currentLevelXP} XP</span>
            <span>{nextLevelXP} XP</span>
          </div>
          <div className="relative">
            <Progress
              value={progress}
              className="h-3 bg-zinc-100"
            />
            <motion.div
              className="absolute top-0 left-0 w-full h-full overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}
            >
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-shimmer" />
            </motion.div>
          </div>
          <div className="text-center text-sm text-blue-600 font-medium">
            {Math.round(nextLevelXP - user.xpPoints)} XP until next level
          </div>
        </div>
      </Card>

      {/* Rewards Preview */}
      <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200/50">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h3 className="font-medium">Level {user.level + 1} Rewards</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <motion.div
              className="w-2 h-2 bg-yellow-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span>New Title: {nextTitle}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <motion.div
              className="w-2 h-2 bg-yellow-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            />
            <span>Bonus XP Multiplier</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <motion.div
              className="w-2 h-2 bg-yellow-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
            />
            <span>Special Achievement</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}