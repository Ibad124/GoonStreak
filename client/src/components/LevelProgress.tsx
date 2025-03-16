import { useState, useEffect, useRef } from "react";
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
  const [showLevelUp, setShowLevelUp] = useState(false);
  const prevLevelRef = useRef<number>(1);

  useEffect(() => {
    const currentLevelInfo = calculateLevel(user.xpPoints);
    if (prevLevelRef.current < currentLevelInfo.currentLevel) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 4000); // Increased duration for longer animation
    }
    prevLevelRef.current = currentLevelInfo.currentLevel;
  }, [user.xpPoints]);

  const levelInfo = calculateLevel(user.xpPoints);
  const nextThreshold = LEVEL_THRESHOLDS[levelInfo.currentLevel + 1];
  const percentage = Math.min(100, Math.max(0, (levelInfo.progress / levelInfo.total) * 100));

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
            className="fixed inset-0 flex items-center justify-center z-[100]"
          >
            {/* Radial gradient background with blur */}
            <motion.div 
              className="absolute inset-0 bg-black/80 backdrop-blur-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Main content container */}
            <div className="relative max-w-2xl w-full mx-4">
              {/* Animated background effects */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-3xl opacity-20"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />

              {/* Main card content */}
              <motion.div
                className="relative bg-black/40 border border-white/20 rounded-3xl overflow-hidden backdrop-blur-xl"
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50 }}
                transition={{ type: "spring", bounce: 0.4 }}
              >
                {/* Particle effects */}
                <div className="absolute inset-0 overflow-hidden">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      initial={{
                        opacity: 1,
                        scale: 0,
                        x: "50%",
                        y: "50%"
                      }}
                      animate={{
                        opacity: 0,
                        scale: Math.random() * 3,
                        x: `${Math.random() * 100}%`,
                        y: `${Math.random() * 100}%`,
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.1,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    />
                  ))}
                </div>

                <div className="relative p-12 text-center">
                  {/* Level up icon with pulsing effect */}
                  <motion.div
                    className="relative inline-block mb-8"
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {/* Glowing background */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 rounded-full blur-2xl"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0.8, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <span className="text-8xl relative z-10">{levelInfo.currentEmoji}</span>
                  </motion.div>

                  {/* Level up text with staggered animation */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.h2
                      className="text-5xl font-black mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      LEVEL UP!
                    </motion.h2>

                    <motion.div
                      className="text-3xl font-bold mb-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      Level {levelInfo.currentLevel} Achieved
                    </motion.div>

                    <motion.div
                      className="text-2xl text-pink-400 font-semibold"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      {levelInfo.currentTitle}
                    </motion.div>
                  </motion.div>

                  {/* Decorative elements */}
                  <div className="absolute inset-0 pointer-events-none">
                    <Sparkles className="absolute top-4 left-4 h-8 w-8 text-yellow-500" />
                    <Sparkles className="absolute top-4 right-4 h-8 w-8 text-yellow-500" />
                    <Sparkles className="absolute bottom-4 left-4 h-8 w-8 text-yellow-500" />
                    <Sparkles className="absolute bottom-4 right-4 h-8 w-8 text-yellow-500" />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 text-white">
        <div className="relative">
          <motion.div
            className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwbDIwLTIwTTAgNDBsMjAtMjBNMTAgNTBsMjAtMjAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIiBzdHJva2Utd2lkdGg9IjIiLz48L3BhdHRlcm4+PC9kZWZzPjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik0wIDBoMjAwdjIwMEgweiIvPjwvc3ZnPg==')]"
          />

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
                    <span className="font-medium">Next: {nextThreshold?.title || "Max Level"}</span>
                    <span className="text-sm text-pink-200/80">
                      {nextThreshold?.title || "Max level reached"}
                    </span>
                  </div>
                </div>
                <span className="text-sm font-bold bg-white/10 px-3 py-1 rounded-full">
                  {Math.round(percentage)}%
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
        </div>
      </Card>
    </motion.div>
  );
}