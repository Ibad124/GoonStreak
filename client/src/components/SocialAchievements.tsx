import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Trophy, Star, Target, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface Achievement {
  id: number;
  title: string;
  description: string;
  type: 'SOCIAL' | 'STREAK' | 'CHALLENGE';
  progress: number;
  total: number;
  unlocked: boolean;
}

export default function SocialAchievements() {
  const { data: achievements = [], isLoading } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements/social"],
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 relative overflow-hidden">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${
                  achievement.unlocked 
                    ? 'bg-gradient-to-br from-yellow-500 to-amber-600'
                    : 'bg-gradient-to-br from-gray-400 to-gray-500'
                } shadow-lg`}>
                  {achievement.type === 'SOCIAL' && <Trophy className="h-6 w-6 text-white" />}
                  {achievement.type === 'STREAK' && <Star className="h-6 w-6 text-white" />}
                  {achievement.type === 'CHALLENGE' && <Target className="h-6 w-6 text-white" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                  {!achievement.unlocked && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                          style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {achievement.progress} / {achievement.total}
                      </p>
                    </div>
                  )}
                </div>
                {achievement.unlocked && (
                  <Button variant="ghost" size="sm" className="ml-auto">
                    <Share2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
