import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Star, Target, Clock, Video, Heart, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

function ActivityIcon({ type }) {
  switch (type) {
    case "ACHIEVEMENT":
      return <Trophy className="h-4 w-4 text-yellow-500" />;
    case "STREAK":
      return <Star className="h-4 w-4 text-orange-500" />;
    case "SESSION":
      return <Video className="h-4 w-4 text-blue-500" />;
    case "LIKE":
      return <Heart className="h-4 w-4 text-red-500" />;
    case "CHAT":
      return <MessageSquare className="h-4 w-4 text-green-500" />;
    default:
      return <Clock className="h-4 w-4 text-zinc-500" />;
  }
}

function ActivityItem({ activity, onJoin, onLike }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex items-start gap-3 p-3 hover:bg-zinc-50/50 rounded-lg transition-colors"
    >
      <div className="mt-1">
        <ActivityIcon type={activity.type} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">
          <span className="font-semibold">{activity.username}</span>{" "}
          {activity.description}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-zinc-500">
            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
          </p>
          {activity.type === "SESSION" && (
            <Button 
              size="sm" 
              variant="outline" 
              className="h-6 px-2 text-xs"
              onClick={() => onJoin(activity)}
            >
              Join Session
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => onLike(activity)}
          >
            <Heart className={`h-4 w-4 ${activity.liked ? 'fill-red-500 text-red-500' : 'text-zinc-400'}`} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function FriendActivity() {
  const [activeTab, setActiveTab] = useState("all");

  const { data: activities = [], error, isLoading } = useQuery({
    queryKey: ["/api/friends/activity"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleJoinSession = (activity) => {
    // Join session logic will be implemented
    console.log("Joining session:", activity);
  };

  const handleLikeActivity = (activity) => {
    // Like activity logic will be implemented
    console.log("Liking activity:", activity);
  };

  if (error) {
    return (
      <Card className="p-4 text-center text-red-500">
        Failed to load friend activities. Please try again later.
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-4 text-center text-zinc-500">
        Loading friend activities...
      </Card>
    );
  }

  const filteredActivities = activeTab === "all" 
    ? activities 
    : activities.filter(activity => activity.type === activeTab);

  return (
    <Card className="overflow-hidden backdrop-blur bg-white/80 border-zinc-200/50">
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-5 p-1">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="SESSION">Sessions</TabsTrigger>
          <TabsTrigger value="ACHIEVEMENT">Achievements</TabsTrigger>
          <TabsTrigger value="STREAK">Streaks</TabsTrigger>
          <TabsTrigger value="CHAT">Chats</TabsTrigger>
        </TabsList>

        <div className="divide-y max-h-[400px] overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {filteredActivities.map((activity) => (
              <ActivityItem 
                key={activity.id} 
                activity={activity} 
                onJoin={handleJoinSession}
                onLike={handleLikeActivity}
              />
            ))}
            {filteredActivities.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 text-center text-sm text-zinc-500"
              >
                <div className="mb-2">No activities to show</div>
                <p className="text-xs text-zinc-400">
                  Activities from your friends will appear here
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Tabs>
    </Card>
  );
}