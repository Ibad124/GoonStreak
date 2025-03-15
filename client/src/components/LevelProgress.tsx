import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, Crown, Trophy, ChevronUp, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LEVEL_THRESHOLDS } from "@shared/schema";
import { calculateLevel } from "@/lib/utils";

interface LevelProgressProps {
  user: {
    xpPoints: number;
    level: number;
  };
}

export default function LevelProgress({ user }: LevelProgressProps) {
  const calculateProgress = () => {
    const currentThreshold = LEVEL_THRESHOLDS[user.level] ? LEVEL_THRESHOLDS[user.level].xp : 0;
    const nextThreshold = LEVEL_THRESHOLDS[user.level + 1] ? LEVEL_THRESHOLDS[user.level + 1].xp : currentThreshold;
    const progress = Math.max(0, user.xpPoints - currentThreshold);
    const total = Math.max(1, nextThreshold - currentThreshold);
    return {
      progress,
      total,
      nextLevelXP: nextThreshold,
      percentage: Math.min(100, (progress / total) * 100)
    };
  };

  const levelInfo = calculateProgress();
  const nextTitle = LEVEL_THRESHOLDS[user.level + 1]?.title || "Max Level";
  const showLevelUp = LEVEL_THRESHOLDS[user.level + 1] && user.xpPoints >= LEVEL_THRESHOLDS[user.level + 1].xp;


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ 
                scale: 1,
                y: 0,
                transition: { type: "spring", bounce: 0.35 }
              }}
              exit={{ scale: 0.8, y: 50 }}
              className="relative"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
                className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-30"
              />
              <motion.div 
                className="relative bg-gradient-to-b from-zinc-900 to-black px-12 py-8 rounded-3xl border border-pink-500/30"
                initial={{ rotateX: -30 }}
                animate={{ rotateX: 0 }}
              >
                <div className="text-center space-y-4">
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Sparkles className="h-12 w-12 text-yellow-400 mx-auto" />
                  </motion.div>
                  <motion.h2 
                    className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-400 to-pink-500 bg-clip-text text-transparent"
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                    }}
                  >
                    Level Up!
                  </motion.h2>
                  <div className="space-y-2">
                    <p className="text-2xl font-medium text-white">
                      Level {user.level}
                    </p>
                    <p className="text-lg text-pink-400 font-medium">
                      {LEVEL_THRESHOLDS[user.level]?.title}
                    </p>
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="pt-4"
                  >
                    <Button 
                      onClick={() => window.location.reload()}
                      className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-2 rounded-full hover:brightness-110"
                    >
                      Continue
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
                <h2 className="text-xl font-semibold">Level {user.level}</h2>
              </div>
              <p className="text-3xl font-bold mb-4">
                {/*levelInfo.currentEmoji*/} {LEVEL_THRESHOLDS[user.level]?.title || "Newbie"} {/* Placeholder - needs proper data mapping */}
              </p>
            </div>

            {/* Progress Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ChevronUp className="h-5 w-5 text-pink-300" />
                  <div className="flex flex-col">
                    <span className="font-medium">Next: {nextTitle}</span>
                    <span className="text-sm text-pink-200/80">
                      {LEVEL_THRESHOLDS[user.level + 1]?.title || "Max level reached"}
                    </span>
                  </div>
                </div>
                <span className="text-sm font-bold bg-white/10 px-3 py-1 rounded-full">
                  {Math.round(progress)}%
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-pink-200">
                  <span>{Math.round(levelInfo.progress)} XP</span>
                  <span>{Math.round(levelInfo.total)} XP</span>
                </div>
                <div className="relative h-4 bg-black/20 rounded-full overflow-hidden backdrop-blur">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300"
                    style={{ width: `${levelInfo.percentage}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${levelInfo.percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
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