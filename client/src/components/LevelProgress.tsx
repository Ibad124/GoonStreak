import { useState, useEffect } from "react";
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

  useEffect(() => {
    const levelInfo = calculateLevel(user.xpPoints);
    const shouldLevelUp = user.xpPoints >= LEVEL_THRESHOLDS[levelInfo.currentLevel + 1]?.points;
    if (shouldLevelUp) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000); // Increased duration for animation
    }
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
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="fixed inset-0 flex items-center justify-center z-[100] bg-black/50 backdrop-blur-sm"
          >
            <div className="relative max-w-lg w-full mx-4">
              {/* Background Effects */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 3,
                  ease: "easeInOut",
                  times: [0, 0.5, 1],
                  repeat: Infinity,
                }}
                className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-50"
              />

              {/* Main Content Card */}
              <motion.div
                className="relative bg-black/90 text-white px-8 py-12 rounded-3xl border border-pink-500/50 backdrop-blur-xl"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
              >
                {/* Particle Effects */}
                <motion.div
                  className="absolute inset-0 overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-white rounded-full"
                      initial={{
                        x: "50%",
                        y: "50%",
                        scale: 0,
                        opacity: 1,
                      }}
                      animate={{
                        x: `${Math.random() * 100}%`,
                        y: `${Math.random() * 100}%`,
                        scale: Math.random() * 2,
                        opacity: 0,
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.1,
                        repeat: Infinity,
                        repeatDelay: 1,
                      }}
                    />
                  ))}
                </motion.div>

                <div className="text-center space-y-6 relative z-10">
                  {/* Level Up Icon */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                    }}
                    className="text-6xl mb-4"
                  >
                    {levelInfo.currentEmoji}
                  </motion.div>

                  {/* Level Up Text */}
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
                      Level Up!
                    </h2>
                    <p className="text-2xl font-semibold mb-4">
                      Level {levelInfo.currentLevel} Achieved!
                    </p>
                    <p className="text-xl text-pink-400 font-medium">
                      {levelInfo.currentTitle}
                    </p>
                  </motion.div>

                  {/* Sparkles */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <div className="absolute top-0 left-0">
                      <Sparkles className="h-8 w-8 text-yellow-500" />
                    </div>
                    <div className="absolute top-0 right-0">
                      <Sparkles className="h-8 w-8 text-yellow-500" />
                    </div>
                    <div className="absolute bottom-0 left-0">
                      <Sparkles className="h-8 w-8 text-yellow-500" />
                    </div>
                    <div className="absolute bottom-0 right-0">
                      <Sparkles className="h-8 w-8 text-yellow-500" />
                    </div>
                  </motion.div>
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