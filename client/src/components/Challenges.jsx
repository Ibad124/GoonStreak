import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Timer, Star } from "lucide-react";

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

  return (
    <Card className="p-4 backdrop-blur bg-white/80 border-zinc-200/50">
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
                <span className="text-sm font-medium">Completed!</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-zinc-500">
                <Timer className="h-4 w-4" />
                <span className="text-sm">{formatTimeLeft(challenge.endDate)}</span>
              </div>
            )}
          </div>

          <p className="text-sm text-zinc-500 mt-1">{challenge.description}</p>

          <div className="mt-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">
                {challenge.progress.currentProgress} / {challenge.requirement}
              </span>
              <span className="text-sm text-primary font-medium">
                +{challenge.xpReward} XP
              </span>
            </div>
            <Progress 
              value={progress} 
              className="h-2"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function Challenges({ challenges }) {
  console.log('Rendering challenges:', challenges);

  if (!challenges?.length) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No active challenges at the moment.
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