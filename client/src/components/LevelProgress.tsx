
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, Crown, Trophy, ChevronUp, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LEVEL_THRESHOLDS } from "@shared/schema";
import { calculateLevel } from "@/lib/utils";
import { useState, useEffect } from 'react';

interface LevelProgressProps {
  user: {
    xpPoints: number;
    level: number;
  };
}

export default function LevelProgress({ user }: LevelProgressProps) {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [prevLevel, setPrevLevel] = useState(user.level);

  useEffect(() => {
    if (user.level > prevLevel) {
      setShowLevelUp(true);
      setPrevLevel(user.level);
      setTimeout(() => setShowLevelUp(false), 3000);
    }
  }, [user.level, prevLevel]);

  const levelInfo = calculateLevel(user.xpPoints);
  const nextTitle = LEVEL_THRESHOLDS[(user.level + 1) as keyof typeof LEVEL_THRESHOLDS]?.title || "Max Level";
  const currentThreshold = LEVEL_THRESHOLDS[user.level]?.xp || 0;
  const nextThreshold = LEVEL_THRESHOLDS[user.level + 1]?.xp || currentThreshold;
  const progress = ((user.xpPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  const percentage = Math.min(100, Math.max(0, progress));

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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ 
                scale: [0.5, 1.2, 1],
                opacity: 1
              }}
              transition={{
                duration: 0.8,
                ease: "easeOut"
              }}
              className="relative flex flex-col items-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2,
                  ease: "easeInOut",
                  times: [0, 0.5, 1],
                  repeat: Infinity,
                }}
                className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 rounded-full blur-3xl opacity-30"
              />
              <motion.div
                className="relative p-8 bg-black/90 rounded-2xl border-2 border-pink-500/50 backdrop-blur-xl"
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-center space-y-4">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 0.5,
                      repeat: Infinity
                    }}
                  >
                    <Sparkles className="h-16 w-16 text-yellow-500 mx-auto" />
                  </motion.div>
                  <motion.h2
                    animate={{ 
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ 
                      duration: 1,
                      repeat: Infinity
                    }}
                    className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
                  >
                    Level Up!
                  </motion.h2>
                  <p className="text-lg">
                    You've reached level {levelInfo.currentLevel}
                  </p>
                  <p className="text-sm text-pink-400">
                    New Title: {LEVEL_THRESHOLDS[levelInfo.currentLevel]?.title}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="relative overflow-hidden">
        <div className="p-6 relative z-10">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Crown className="h-6 w-6 text-yellow-300" />
              <h2 className="text-xl font-semibold">Level {levelInfo.currentLevel}</h2>
            </div>
            <p className="text-3xl font-bold mb-4">
              {levelInfo.currentEmoji} {levelInfo.currentTitle}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChevronUp className="h-5 w-5 text-pink-300" />
                <div className="flex flex-col">
                  <span className="font-medium">Next: {nextTitle}</span>
                  <span className="text-sm text-pink-200/80">
                    {LEVEL_THRESHOLDS[levelInfo.currentLevel + 1]?.title || "Max level reached"}
                  </span>
                </div>
              </div>
              <span className="text-sm font-bold bg-white/10 px-3 py-1 rounded-full">
                {Math.round(progress)}%
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-pink-200">
                <span>{levelInfo.progress} XP</span>
                <span>{levelInfo.total} XP</span>
              </div>
              <div className="relative h-4 bg-black/20 rounded-full overflow-hidden backdrop-blur">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300"
                  style={{ width: `${percentage}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
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
      </Card>
    </motion.div>
  );
}
