import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Star, Crown, Flame, Award } from "lucide-react";

const rankColors = {
  1: "from-yellow-500 to-amber-600",
  2: "from-slate-400 to-slate-500",
  3: "from-amber-700 to-amber-800",
};

const achievementIcons = {
  STREAK_3: Trophy,
  STREAK_7: Medal,
  STREAK_30: Crown,
  SESSIONS_10: Star,
  CHALLENGE_MASTER: Award,
};

function UserRankCard({ user, rank, isCurrentUser }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`
        relative p-4 rounded-xl backdrop-blur-sm
        ${isCurrentUser ? 'ring-2 ring-primary ring-offset-2' : 'hover:bg-accent/5'}
        transition-all duration-300
      `}
    >
      {/* Rank Badge */}
      <div className="absolute -left-2 -top-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`
            w-8 h-8 rounded-full flex items-center justify-center text-white font-bold
            bg-gradient-to-br ${rankColors[rank] || 'from-zinc-600 to-zinc-700'}
            shadow-lg
          `}
        >
          {rank}
        </motion.div>
      </div>

      <div className="flex items-center gap-4 ml-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold truncate">{user.username}</span>
            {user.currentStreak >= 3 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-2 py-0.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full text-white text-xs font-bold shadow-sm flex items-center gap-1"
              >
                <Flame className="w-3 h-3" />
                {user.currentStreak}
              </motion.div>
            )}
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="font-medium">{user.xpPoints} XP</span>
            <span>•</span>
            <span>Level {user.level}</span>
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="flex gap-1">
          <AnimatePresence>
            {user.achievements?.map((achievement, index) => {
              const Icon = achievementIcons[achievement.type] || Trophy;
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0, x: -20 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    x: 0,
                    transition: { delay: index * 0.1 } 
                  }}
                  className="relative group"
                >
                  <div className={`
                    p-1.5 rounded-full 
                    ${achievement.type.includes('STREAK') ? 'bg-gradient-to-br from-orange-500 to-orange-600' : 'bg-gradient-to-br from-primary to-primary/90'}
                    shadow-lg
                  `}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/90 text-white text-xs rounded-lg px-2 py-1">
                      {achievement.description}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Background glow for top 3 */}
      {rank <= 3 && (
        <motion.div
          className={`
            absolute inset-0 -z-10 rounded-xl opacity-20
            bg-gradient-to-br ${rankColors[rank]}
          `}
          animate={{
            opacity: [0.1, 0.2, 0.1],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      )}
    </motion.div>
  );
}

export default function FriendsLeaderboard() {
  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ["/api/leaderboard"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Trophy className="w-8 h-8 text-primary/50" />
        </motion.div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden backdrop-blur bg-white/80 border-zinc-200/50">
      <div className="p-4 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Friend Rankings
        </h3>
      </div>
      <div className="p-4 space-y-4">
        {leaderboard.length > 0 ? (
          leaderboard.map((userData, index) => (
            <UserRankCard
              key={userData.id}
              user={userData}
              rank={index + 1}
              isCurrentUser={userData.id === user?.id}
            />
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-muted-foreground"
          >
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No rankings available yet</p>
            <p className="text-sm mt-2 opacity-80">
              Complete challenges and maintain streaks to climb the rankings!
            </p>
          </motion.div>
        )}
      </div>
    </Card>
  );
}
