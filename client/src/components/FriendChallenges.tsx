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
  Plus,
  Crown,
  Star
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { DatePicker } from "@/components/ui/date-picker";
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
  circleId?: number;
}

export default function FriendChallenges() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const { data: challenges, isLoading } = useQuery<FriendChallenge[]>({
    queryKey: ["/api/friends/challenges"],
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });

  const joinChallengeMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      const res = await apiRequest("POST", `/api/friends/challenges/${challengeId}/join`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends/challenges"] });
      toast({
        title: "Joined Challenge! 🎯",
        description: "You're now participating in this challenge.",
      });
    },
  });

  const createChallengeMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      endDate: string;
      targetValue: number;
      type: "DAILY" | "WEEKLY" | "CUSTOM";
      circleId?: number;
    }) => {
      const res = await apiRequest("POST", "/api/friends/challenges", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends/challenges"] });
      setIsCreateOpen(false);
      toast({
        title: "Challenge Created! 🎉",
        description: "Your new challenge is ready for friends to join.",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card
            key={i}
            className="p-6 animate-pulse bg-gradient-to-r from-purple-500/5 to-pink-500/5"
          >
            <div className="h-6 w-1/3 bg-purple-500/20 rounded mb-4" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-purple-500/20 rounded" />
              <div className="h-4 w-2/3 bg-purple-500/20 rounded" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-400" />
          Friend Challenges
        </h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Challenge
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-purple-500/20">
            <DialogHeader>
              <DialogTitle className="text-white">Create a Friend Challenge</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createChallengeMutation.mutate({
                  title: formData.get("title") as string,
                  description: formData.get("description") as string,
                  endDate: formData.get("endDate") as string,
                  targetValue: parseInt(formData.get("targetValue") as string),
                  type: formData.get("type") as "DAILY" | "WEEKLY" | "CUSTOM",
                  circleId: formData.get("circleId") ? parseInt(formData.get("circleId") as string) : undefined,
                });
              }}
              className="space-y-4 pt-4"
            >
              <Input
                name="title"
                placeholder="Challenge Title"
                className="bg-black/20 border-purple-500/20"
              />
              <Textarea
                name="description"
                placeholder="Challenge Description"
                className="bg-black/20 border-purple-500/20"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="targetValue"
                  type="number"
                  placeholder="Target Value"
                  className="bg-black/20 border-purple-500/20"
                />
                <DatePicker name="endDate" />
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  disabled={createChallengeMutation.isPending}
                >
                  Create Challenge
                </Button>
              </DialogFooter>
            </form>
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
                <div className="flex items-center gap-2 mb-1">
                  {challenge.circleId && (
                    <Crown className="h-4 w-4 text-yellow-500" />
                  )}
                  <h3 className="text-lg font-semibold text-white">{challenge.title}</h3>
                  {challenge.type === "DAILY" && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-purple-500/20 rounded-full text-purple-300">
                      Daily
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-300">
                  {challenge.description}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 hover:bg-white/10 rounded-full"
                disabled={joinChallengeMutation.isPending}
                onClick={() => joinChallengeMutation.mutate(challenge.id)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-gray-300">
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
                  <span>Ends {formatDistanceToNow(new Date(challenge.endDate), { addSuffix: true })}</span>
                </div>
              </div>

              <div className="space-y-2">
                {challenge.participants.map((participant) => (
                  <div key={participant.userId} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300">{participant.username}</span>
                        {participant.completed && (
                          <Star className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <span className="text-purple-400">{participant.progress}%</span>
                    </div>
                    <Progress 
                      value={participant.progress} 
                      className="h-2 bg-black/20"
                      indicatorClassName="bg-gradient-to-r from-purple-500 to-pink-500"
                    />
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