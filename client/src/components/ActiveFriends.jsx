import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Video, MessageSquare, Trophy, Clock, Flame } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ActiveFriends() {
  const { toast } = useToast();
  const { data: friends = [], isLoading } = useQuery({
    queryKey: ["/api/friends/active"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const handleJoinSession = (friend) => {
    toast({
      title: "Coming soon!",
      description: "Training sessions will be available soon.",
    });
  };

  const handleMessage = (friend) => {
    toast({
      title: "Coming soon!",
      description: "Direct messaging will be available soon.",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="h-16 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {friends.length > 0 ? (
          friends.map((friend) => (
            <motion.div
              key={friend.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-3 hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <motion.div
                      className="w-2 h-2 bg-green-500 rounded-full"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.5, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </div>
                  <div>
                    <div className="font-medium text-white flex items-center gap-2">
                      {friend.username}
                      {friend.currentStreak >= 7 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="px-2 py-0.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full text-white text-xs font-bold shadow-lg"
                        >
                          <Flame className="h-3 w-3 inline mr-1" />
                          {friend.currentStreak}
                        </motion.div>
                      )}
                    </div>
                    <div className="text-sm text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {friend.status || `Active ${formatDistanceToNow(new Date(friend.lastActive), { addSuffix: true })}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 rounded-full hover:bg-white/10"
                    onClick={() => handleMessage(friend)}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 rounded-full hover:bg-white/10"
                    onClick={() => handleJoinSession(friend)}
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8 text-center"
          >
            <Trophy className="h-12 w-12 mx-auto mb-3 text-purple-400/50" />
            <p className="text-gray-400">No friends online right now</p>
            <p className="text-sm text-gray-500 mt-1">
              They'll appear here when they're active
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}