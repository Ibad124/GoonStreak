import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Star, Target, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

function ActivityIcon({ type }) {
  switch (type) {
    case "ACHIEVEMENT":
      return <Trophy className="h-4 w-4 text-yellow-500" />;
    case "STREAK":
      return <Star className="h-4 w-4 text-orange-500" />;
    case "CHALLENGE":
      return <Target className="h-4 w-4 text-blue-500" />;
    default:
      return <Clock className="h-4 w-4 text-zinc-500" />;
  }
}

function ActivityItem({ activity }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
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
        <p className="text-xs text-zinc-500">
          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
        </p>
      </div>
    </motion.div>
  );
}

export default function FriendActivity() {
  const [activeTab, setActiveTab] = useState("all");

  const { data: activities = [] } = useQuery({
    queryKey: ["/api/friends/activity"],
  });

  const filteredActivities = activeTab === "all" 
    ? activities 
    : activities.filter(activity => activity.type === activeTab);

  return (
    <Card className="overflow-hidden backdrop-blur bg-white/80 border-zinc-200/50">
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
          <TabsTrigger value="ACHIEVEMENT" className="flex-1">Achievements</TabsTrigger>
          <TabsTrigger value="STREAK" className="flex-1">Streaks</TabsTrigger>
          <TabsTrigger value="CHALLENGE" className="flex-1">Challenges</TabsTrigger>
        </TabsList>

        <div className="divide-y max-h-[400px] overflow-y-auto">
          <AnimatePresence>
            {filteredActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
            {filteredActivities.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 text-center text-sm text-zinc-500"
              >
                No activities to show
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Tabs>
    </Card>
  );
}
