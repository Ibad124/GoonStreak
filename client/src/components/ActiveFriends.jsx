import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Video, MessageSquare, Trophy, Clock, Flame } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ActiveFriends() {
  const { toast } = useToast();
  const { data: friends = [] } = useQuery({
    queryKey: ["/api/friends"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const activeFriends = friends.filter(friend => friend.isOnline);

  const handleJoinSession = (friend) => {
    toast({
      title: "Coming soon!",
      description: "Join session feature will be available soon.",
    });
  };

  const handleMessage = (friend) => {
    toast({
      title: "Coming soon!",
      description: "Direct messaging will be available soon.",
    });
  };

  return (
    <Card className="overflow-hidden backdrop-blur bg-white/80 border-zinc-200/50">
      <div className="p-4 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          <div className="relative">
            <motion.div
              className="w-2 h-2 bg-green-500 rounded-full absolute -right-1 -top-1"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
            Active Friends
          </div>
        </h3>
      </div>

      <div className="p-2">
        <AnimatePresence mode="popLayout">
          {activeFriends.length > 0 ? (
            activeFriends.map((friend) => (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-3 hover:bg-accent/5 rounded-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <motion.div
                        className="w-2 h-2 bg-green-500 rounded-full"
                        animate={{
                          scale: [1, 1.2, 1],
                          boxShadow: [
                            "0 0 0 0 rgba(34, 197, 94, 0)",
                            "0 0 0 10px rgba(34, 197, 94, 0)",
                            "0 0 0 0 rgba(34, 197, 94, 0)",
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                      />
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
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
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
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
                      className="h-8 w-8 p-0 rounded-full"
                      onClick={() => handleMessage(friend)}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 rounded-full"
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
              className="py-8 text-center text-muted-foreground"
            >
              <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No friends online right now</p>
              <p className="text-sm mt-1 opacity-80">
                They'll appear here when they're active
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
