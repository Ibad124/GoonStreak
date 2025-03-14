import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Check, X, Search, Circle, Trophy, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import FriendActivity from "./FriendActivity";

// FriendRequestCard component remains the same
function FriendRequestCard({ request, onAccept, onReject }) {
  const { otherUser } = request;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-zinc-50/50 transition-colors"
    >
      <div>
        <h3 className="font-medium">{otherUser.username}</h3>
        <p className="text-sm text-muted-foreground">{otherUser.title}</p>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          className="rounded-full group relative overflow-hidden"
          onClick={() => onAccept(request.id)}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Check className="h-4 w-4" />
          </motion.div>
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full group relative overflow-hidden"
          onClick={() => onReject(request.id)}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="h-4 w-4" />
          </motion.div>
        </Button>
      </div>
    </motion.div>
  );
}

// Enhanced FriendCard component
function FriendCard({ friend }) {
  const isOnlineIndicator = friend.isOnline ? "bg-green-500" : "bg-zinc-300";
  const lastActive = friend.lastActive
    ? formatDistanceToNow(new Date(friend.lastActive), { addSuffix: true })
    : "Never";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-zinc-50/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <motion.div
          className={`h-2 w-2 rounded-full ${isOnlineIndicator}`}
          initial={{ scale: 0.5 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{
            repeat: Infinity,
            duration: 2,
            repeatType: "reverse"
          }}
        />
        <div>
          <h3 className="font-medium">{friend.username}</h3>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            {friend.status ? (
              <>
                <Clock className="h-3 w-3" />
                {friend.status}
              </>
            ) : (
              <>
                <Circle className="h-3 w-3" />
                Last active {lastActive}
              </>
            )}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-medium flex items-center gap-1">
          <Trophy className="h-3 w-3 text-amber-500" />
          {friend.title}
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Circle className="h-3 w-3 fill-current" />
          {friend.currentStreak} day streak
        </div>
      </div>
    </motion.div>
  );
}

// New component for searching and adding friends
function AddFriendDialog() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: searchResults = [] } = useQuery({
    queryKey: ["/api/users/search", searchQuery],
    enabled: searchQuery.length >= 3,
  });

  const sendRequestMutation = useMutation({
    mutationFn: async (userId) => {
      const res = await apiRequest("POST", "/api/friends/request", {
        receiverId: userId,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
      toast({
        title: "Friend request sent",
        description: "They'll be notified of your request.",
      });
    },
    onError: (error) => {
      toast({
        title: "Couldn't send friend request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <UserPlus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Friend</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="space-y-2">
            {searchResults.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div>
                  <div className="font-medium">{user.username}</div>
                  <div className="text-sm text-muted-foreground">{user.title}</div>
                </div>
                <Button
                  size="sm"
                  disabled={sendRequestMutation.isPending}
                  onClick={() => sendRequestMutation.mutate(user.id)}
                >
                  Add Friend
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function FriendsList() {
  const [friendSearchQuery, setFriendSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: friends = [] } = useQuery({
    queryKey: ["/api/friends"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["/api/friends/requests"],
  });

  const pendingRequests = requests.filter(
    (request) => request.status === "pending"
  );

  const respondToRequestMutation = useMutation({
    mutationFn: async ({ requestId, status }) => {
      const res = await apiRequest(
        "POST",
        `/api/friends/request/${requestId}/respond`,
        { status }
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
    },
    onError: (error) => {
      toast({
        title: "Couldn't respond to request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAcceptRequest = (requestId) => {
    respondToRequestMutation.mutate({ requestId, status: "accepted" });
  };

  const handleRejectRequest = (requestId) => {
    respondToRequestMutation.mutate({ requestId, status: "rejected" });
  };

  return (
    <div className="space-y-6">
      {/* Friend Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <FriendActivity />
      </motion.div>

      {/* Friend Requests Section */}
      <AnimatePresence>
        {pendingRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="backdrop-blur bg-white/80 border-zinc-200/50 shadow-lg shadow-blue-900/5">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Friend Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y">
                {pendingRequests.map((request) => (
                  <FriendRequestCard
                    key={request.id}
                    request={request}
                    onAccept={handleAcceptRequest}
                    onReject={handleRejectRequest}
                  />
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Friends List Section */}
      <Card className="backdrop-blur bg-white/80 border-zinc-200/50 shadow-lg shadow-blue-900/5">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center justify-between">
            <span>Friends</span>
            <AddFriendDialog />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search friends..."
              value={friendSearchQuery}
              onChange={(e) => setFriendSearchQuery(e.target.value)}
              className="pl-9 rounded-full"
            />
          </div>
          <motion.div
            className="divide-y"
            layout
          >
            {friends
              .filter((friend) =>
                friend.username
                  .toLowerCase()
                  .includes(friendSearchQuery.toLowerCase())
              )
              .map((friend) => (
                <FriendCard key={friend.friendshipId} friend={friend} />
              ))}
            {friends.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-muted-foreground"
              >
                No friends yet. Start by adding some friends!
              </motion.div>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}