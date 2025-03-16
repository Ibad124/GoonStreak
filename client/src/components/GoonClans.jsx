import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Crown,
  Users,
  Star,
  Plus,
  Trophy,
  Sparkles
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function GoonClans() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const { data: clans, isLoading } = useQuery({
    queryKey: ["/api/clans"],
    refetchInterval: 30000, // Real-time updates
  });

  const createClanMutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiRequest("POST", "/api/clans", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clans"] });
      setIsCreateOpen(false);
      toast({
        title: "Clan Created! 🎉",
        description: "Your new clan is ready for goons to join!",
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
          <Crown className="h-5 w-5 text-purple-400" />
          Goon Clans
        </h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Clan
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-purple-500/20">
            <DialogHeader>
              <DialogTitle className="text-white">Create a Goon Clan</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createClanMutation.mutate({
                  name: formData.get("name"),
                  description: formData.get("description"),
                  motto: formData.get("motto"),
                });
              }}
              className="space-y-4 pt-4"
            >
              <Input
                name="name"
                placeholder="Clan Name"
                className="bg-black/20 border-purple-500/20"
              />
              <Input
                name="description"
                placeholder="Clan Description"
                className="bg-black/20 border-purple-500/20"
              />
              <Input
                name="motto"
                placeholder="Clan Motto"
                className="bg-black/20 border-purple-500/20"
              />
              <DialogFooter>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  disabled={createClanMutation.isPending}
                >
                  Create Clan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {clans?.map((clan) => (
          <motion.div
            key={clan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/20 rounded-xl border border-purple-500/20 p-6 hover:bg-black/30 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-white">{clan.name}</h3>
                  {clan.rank === 1 && (
                    <Crown className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
                <p className="text-gray-400">{clan.description}</p>
                <p className="text-sm text-purple-400 mt-1 italic">"{clan.motto}"</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-purple-400" />
                  <span>{clan.memberCount} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-yellow-400" />
                  <span>{clan.totalAchievements} achievements</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-pink-400" />
                  <span>Level {clan.level}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {clan.topMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white text-sm">{member.username[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm text-white">{member.username}</p>
                      <p className="text-xs text-gray-400">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  className="bg-purple-500/20 hover:bg-purple-500/40 text-white gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Join Clan
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
