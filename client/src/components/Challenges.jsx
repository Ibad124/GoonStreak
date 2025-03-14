import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Timer, Star, Calendar } from "lucide-react";
import { motion } from "framer-motion";

function formatTimeLeft(endDate) {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end - now;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h left`;
  }
  return `${hours}h ${minutes}m left`;
}

function ChallengeCard({ challenge }) {
  const progress = (challenge.progress.currentProgress / challenge.requirement) * 100;

  const getProgressColor = (progress) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 75) return "bg-blue-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-primary";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="p-4 backdrop-blur bg-white/80 border-zinc-200/50 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-full bg-primary/10">
            <Trophy className="h-6 w-6 text-primary" />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{challenge.title}</h3>
              {challenge.progress.completed ? (
                <div className="flex items-center gap-1 text-green-500">
                  <Star className="h-4 w-4" />
                  <span className="text-sm font-medium">Complete!</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-zinc-500">
                  <Timer className="h-4 w-4" />
                  <span className="text-sm">{formatTimeLeft(challenge.endDate)}</span>
                </div>
              )}
            </div>

            <p className="text-sm text-zinc-500 mt-1">{challenge.description}</p>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Progress</span>
                  <span className="text-zinc-500">
                    {challenge.progress.currentProgress} / {challenge.requirement}
                  </span>
                </div>
                <span className="text-primary font-medium">
                  +{challenge.xpReward} XP
                </span>
              </div>

              <div className="relative h-2">
                <div className="absolute inset-0 bg-zinc-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${getProgressColor(progress)} transition-colors duration-300`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function Challenges({ challenges }) {
  if (!challenges?.length) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
        <p>No active challenges at the moment.</p>
        <p className="text-sm mt-1">Check back tomorrow for new challenges!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {challenges.map((challenge) => (
        <ChallengeCard key={challenge.id} challenge={challenge} />
      ))}
    </div>
  );
}