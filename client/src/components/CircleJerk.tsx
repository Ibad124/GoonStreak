import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Trophy,
  Target,
  Plus,
  Crown,
  MessageCircle,
  Calendar,
  Clock,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

interface Circle {
  id: number;
  name: string;
  memberCount: number;
  isOwner: boolean;
  createdAt: string;
  activeChallenge?: {
    id: number;
    title: string;
    description: string;
    progress: number;
    endDate: string;
    participants: {
      userId: number;
      username: string;
      progress: number;
    }[];
  };
}

export default function CircleJerk() {
  const [isCreateCircleOpen, setIsCreateCircleOpen] = useState(false);
  const [isCreateChallengeOpen, setIsCreateChallengeOpen] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);
  const { toast } = useToast();

  const { data: circles, isLoading } = useQuery<Circle[]>({
    queryKey: ["/api/circles"],
  });

  const createCircleMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await apiRequest("POST", "/api/circles", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/circles"] });
      setIsCreateCircleOpen(false);
      toast({
        title: "Circle Created! 🎉",
        description: "Your new circle is ready for action.",
      });
    },
  });

  const createChallengeMutation = useMutation({
    mutationFn: async (data: {
      circleId: number;
      title: string;
      description: string;
      endDate: string;
      targetValue: number;
    }) => {
      const res = await apiRequest(
        "POST",
        `/api/circles/${data.circleId}/challenge`,
        data
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/circles"] });
      setIsCreateChallengeOpen(false);
      toast({
        title: "Challenge Created! 🎯",
        description: "The circle challenge has been created.",
      });
    },
  });

  const joinCircleMutation = useMutation({
    mutationFn: async (circleId: number) => {
      const res = await apiRequest("POST", `/api/circles/${circleId}/join`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/circles"] });
      toast({
        title: "Joined Circle! 👥",
        description: "You're now part of this circle.",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-400" />
          Circle Jerk
        </h2>
        <Button
          onClick={() => setIsCreateCircleOpen(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Circle
        </Button>
      </div>

      {/* Circles Grid */}
      <div className="grid gap-4">
        {circles?.map((circle) => (
          <motion.div
            key={circle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20 backdrop-blur-sm overflow-hidden"
          >
            <div className="p-6">
              {/* Circle Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-white">
                      {circle.name}
                    </h3>
                    {circle.isOwner && (
                      <Crown className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {circle.memberCount} members
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Created {formatDistanceToNow(new Date(circle.createdAt))} ago
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {circle.isOwner ? (
                    <Button
                      variant="outline"
                      className="bg-white/5 hover:bg-white/10 border-purple-500/20"
                      onClick={() => {
                        setSelectedCircle(circle);
                        setIsCreateChallengeOpen(true);
                      }}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      New Challenge
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="bg-white/5 hover:bg-white/10 border-purple-500/20"
                      onClick={() => joinCircleMutation.mutate(circle.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Join Circle
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-white/10"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Active Challenge */}
              {circle.activeChallenge && (
                <div className="bg-black/20 rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-white mb-1">
                        {circle.activeChallenge.title}
                      </h4>
                      <p className="text-sm text-gray-300">
                        {circle.activeChallenge.description}
                      </p>
                    </div>
                    <div className="text-sm text-gray-300 flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDistanceToNow(
                        new Date(circle.activeChallenge.endDate),
                        { addSuffix: true }
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {circle.activeChallenge.participants.map((participant) => (
                      <div key={participant.userId} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">
                            {participant.username}
                          </span>
                          <span className="text-purple-400">
                            {participant.progress}%
                          </span>
                        </div>
                        <Progress value={participant.progress} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Circle Dialog */}
      <Dialog open={isCreateCircleOpen} onOpenChange={setIsCreateCircleOpen}>
        <DialogContent className="bg-slate-900 border-purple-500/20">
          <DialogHeader>
            <DialogTitle className="text-white">Create a New Circle</DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a circle to challenge and motivate each other.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              createCircleMutation.mutate({
                name: formData.get("name") as string,
              });
            }}
            className="space-y-4 pt-4"
          >
            <Input
              name="name"
              placeholder="Circle Name"
              className="bg-black/20 border-purple-500/20"
            />
            <DialogFooter>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                disabled={createCircleMutation.isPending}
              >
                Create Circle
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Challenge Dialog */}
      <Dialog
        open={isCreateChallengeOpen}
        onOpenChange={setIsCreateChallengeOpen}
      >
        <DialogContent className="bg-slate-900 border-purple-500/20">
          <DialogHeader>
            <DialogTitle className="text-white">Create Circle Challenge</DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a new challenge for your circle members.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!selectedCircle) return;

              const formData = new FormData(e.currentTarget);
              createChallengeMutation.mutate({
                circleId: selectedCircle.id,
                title: formData.get("title") as string,
                description: formData.get("description") as string,
                endDate: formData.get("endDate") as string,
                targetValue: parseInt(formData.get("targetValue") as string),
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
  );
}