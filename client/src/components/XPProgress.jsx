import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, Trophy, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
        <motion.span 
          key={user.level}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-sm text-zinc-500"
        >
          Level {user.level}
        </motion.span>
      </div>

      <div className="mt-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-zinc-500">XP Progress</span>
          <motion.span 
            key={user.xpPoints}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-sm font-medium"
          >
            {user.xpPoints} / {nextLevelXP}
          </motion.span>
        </div>
        <div className="relative">
          <Progress 
            value={xpProgress} 
            className="h-2 bg-zinc-100"
          />
          <AnimatePresence>
            {xpProgress > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute top-1/2 -translate-y-1/2"
                style={{ left: `${xpProgress}%` }}
              >
                <div className="w-1 h-1 bg-blue-500 rounded-full" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-4 text-sm text-zinc-500">
        {nextLevelXP - user.xpPoints} XP needed for next level
      </div>
    </Card>
  );
}