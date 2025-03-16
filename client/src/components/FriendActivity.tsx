import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  Activity,
  Trophy,
  Target,
  Star,
  MessageSquare,
  UserPlus,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: number;
  userId: number;
  username: string;
  type: string;
  description: string;
  timestamp: string;
  xpGained?: number;
  achievementTitle?: string;
  challengeTitle?: string;
}

export default function FriendActivity() {
  const { data: activities, isLoading } = useQuery<ActivityItem[]>({
    queryKey: ["/api/friends/activity"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "SESSION":
        return <Activity className="h-4 w-4 text-green-500" />;
      case "ACHIEVEMENT":
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case "CHALLENGE":
        return <Target className="h-4 w-4 text-blue-500" />;
      case "LEVEL_UP":
        return <Star className="h-4 w-4 text-purple-500" />;
      case "FRIEND_REQUEST":
        return <UserPlus className="h-4 w-4 text-pink-500" />;
      default:
        return <Award className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "SESSION":
        return "from-green-500/10 to-green-600/10 border-green-500/20";
      case "ACHIEVEMENT":
        return "from-yellow-500/10 to-yellow-600/10 border-yellow-500/20";
      case "CHALLENGE":
        return "from-blue-500/10 to-blue-600/10 border-blue-500/20";
      case "LEVEL_UP":
        return "from-purple-500/10 to-purple-600/10 border-purple-500/20";
      case "FRIEND_REQUEST":
        return "from-pink-500/10 to-pink-600/10 border-pink-500/20";
      default:
        return "from-gray-500/10 to-gray-600/10 border-gray-500/20";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            className="p-4 animate-pulse bg-gradient-to-r from-gray-500/5 to-gray-600/5"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-500/20" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 bg-gray-500/20 rounded" />
                <div className="h-3 w-2/3 bg-gray-500/20 rounded" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <AnimatePresence mode="popLayout">
      <div className="space-y-4">
        {activities?.map((activity) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`relative bg-gradient-to-r ${getActivityColor(
              activity.type
            )} rounded-xl p-4 border backdrop-blur-sm`}
          >
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarFallback>
                  {activity.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold truncate">
                    {activity.username}
                  </span>
                  {getActivityIcon(activity.type)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {activity.description}
                </p>
                {activity.xpGained && (
                  <p className="text-xs text-emerald-500 mt-1">
                    +{activity.xpGained} XP
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {formatDistanceToNow(new Date(activity.timestamp), {
                    addSuffix: true,
                  })}
                </p>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 rounded-full hover:bg-white/10"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Send a message</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
}