import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Users, Clock, Trophy, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Challenge {
  id: number;
  title: string;
  description: string;
  participants: number;
  duration: string;
  reward: string;
  endDate: string;
  joined: boolean;
}

export default function SocialChallenges() {
  const { toast } = useToast();
  const { data: challenges = [], isLoading } = useQuery<Challenge[]>({
    queryKey: ["/api/challenges/social"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const joinChallengeMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      const res = await apiRequest("POST", `/api/challenges/${challengeId}/join`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/challenges/social"] });
      toast({
        title: "Challenge Joined!",
        description: "Good luck on your new challenge!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to join challenge",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {challenges.map((challenge, index) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{challenge.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {challenge.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {challenge.participants} participants
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {challenge.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      {challenge.reward}
                    </div>
                  </div>
                </div>
                <Button
                  className={`ml-auto ${
                    challenge.joined 
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                  }`}
                  onClick={() => !challenge.joined && joinChallengeMutation.mutate(challenge.id)}
                  disabled={joinChallengeMutation.isPending || challenge.joined}
                >
                  {challenge.joined ? (
                    'Joined'
                  ) : (
                    <>
                      Join Challenge
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
