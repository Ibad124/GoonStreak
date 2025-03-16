import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Users,
  Trophy,
  Target,
  Clock,
  ChevronRight,
  Plus
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

interface FriendChallenge {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  creatorId: number;
  participants: {
    userId: number;
    username: string;
    progress: number;
    completed: boolean;
  }[];
  type: "DAILY" | "WEEKLY" | "CUSTOM";
  targetValue: number;
  reward: number;
}

export default function FriendChallenges() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: challenges, isLoading } = useQuery<FriendChallenge[]>({
    queryKey: ["/api/friends/challenges"],
  });

  const joinChallengeMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      const res = await apiRequest("POST", `/api/friends/challenges/${challengeId}/join`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends/challenges"] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card
            key={i}
            className="p-6 animate-pulse bg-gradient-to-r from-gray-500/5 to-gray-600/5"
          >
            <div className="h-6 w-1/3 bg-gray-500/20 rounded mb-4" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-500/20 rounded" />
              <div className="h-4 w-2/3 bg-gray-500/20 rounded" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Friend Challenges</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Challenge
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a Friend Challenge</DialogTitle>
            </DialogHeader>
            {/* Add challenge creation form here */}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {challenges?.map((challenge) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20 backdrop-blur-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">{challenge.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {challenge.description}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                disabled={joinChallengeMutation.isPending}
                onClick={() => joinChallengeMutation.mutate(challenge.id)}
                className="shrink-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-purple-400" />
                  <span>{challenge.participants.length} participants</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-yellow-400" />
                  <span>{challenge.reward} XP reward</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span>{formatDistanceToNow(new Date(challenge.endDate), { addSuffix: true })}</span>
                </div>
              </div>

              <div className="space-y-2">
                {challenge.participants.map((participant) => (
                  <div key={participant.userId} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{participant.username}</span>
                      <span>{participant.progress}%</span>
                    </div>
                    <Progress value={participant.progress} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}