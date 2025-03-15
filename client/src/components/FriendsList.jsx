import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Check, X, Search, Circle, Trophy, Clock, UserMinus, MessageSquare, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

function FriendRequestCard({ request, onAccept, onReject }) {
  const { otherUser } = request;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex items-center justify-between p-4 hover:bg-accent/5 transition-colors rounded-lg"
    >
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <h3 className="font-medium">{otherUser.username}</h3>
          <p className="text-sm text-muted-foreground">{otherUser.title}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          className="rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
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
          className="rounded-full hover:bg-destructive/10 transition-colors"
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

function FriendCard({ friend, onRemove, onMessage }) {
  const [isHovered, setIsHovered] = useState(false);
  const isOnlineIndicator = friend.isOnline ? "bg-green-500" : "bg-zinc-300";
  const lastActive = friend.lastActive
    ? formatDistanceToNow(new Date(friend.lastActive), { addSuffix: true })
    : "Never";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 hover:bg-accent/5 transition-all duration-300 rounded-lg relative group"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            className={`h-2 w-2 rounded-full ${isOnlineIndicator}`}
            initial={{ scale: 0.5 }}
            animate={{ 
              scale: friend.isOnline ? [1, 1.2, 1] : 1,
              boxShadow: friend.isOnline ? ["0 0 0 0 rgba(34, 197, 94, 0)", "0 0 0 10px rgba(34, 197, 94, 0)"] : "none"
            }}
            transition={{
              repeat: friend.isOnline ? Infinity : 0,
              duration: 2,
              repeatType: "reverse"
            }}
          />
          <div>
            <h3 className="font-medium flex items-center gap-2">
              {friend.username}
              {friend.currentStreak >= 7 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-2 py-0.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full text-white text-xs font-bold shadow-lg"
                >
                  🔥 {friend.currentStreak}
                </motion.div>
              )}
            </h3>
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

        <div className="text-right flex items-center gap-4">
          <div>
            <div className="text-sm font-medium flex items-center gap-1">
              <Trophy className="h-3 w-3 text-amber-500" />
              {friend.title}
            </div>
            <div className="text-xs text-muted-foreground">
              Level {friend.level}
            </div>
          </div>

          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2"
              >
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full h-8 w-8 p-0"
                  onClick={() => onMessage(friend)}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full h-8 w-8 p-0 text-destructive hover:text-destructive"
                  onClick={() => onRemove(friend)}
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {friend.currentStreak >= 30 && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function AddFriendDialog() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["/api/users/search", searchQuery],
    enabled: searchQuery.length >= 3,
  });

  const sendRequestMutation = useMutation({
    mutationFn: async (userId) => {
      const res = await apiRequest("POST", "/api/friends/request", {
        receiverId: userId,
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
      toast({
        title: "Friend request sent! 🤝",
        description: "They'll be notified of your request.",
        variant: "default",
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
        <Button 
          variant="outline" 
          size="sm"
          className="rounded-full flex items-center gap-2 hover:bg-primary/5 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add Friend</span>
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
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Search className="h-5 w-5 mx-auto mb-2" />
                </motion.div>
                Searching...
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/5 transition-colors"
                >
                  <div>
                    <div className="font-medium">{user.username}</div>
                    <div className="text-sm text-muted-foreground">{user.title}</div>
                  </div>
                  <Button
                    size="sm"
                    disabled={sendRequestMutation.isPending}
                    onClick={() => sendRequestMutation.mutate(user.id)}
                    className="rounded-full"
                  >
                    {sendRequestMutation.isPending ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Circle className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Friend
                      </>
                    )}
                  </Button>
                </motion.div>
              ))
            ) : searchQuery.length >= 3 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UserMinus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No users found
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Type at least 3 characters to search
              </div>
            )}
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

  const removeFriendMutation = useMutation({
    mutationFn: async (friendId) => {
      const res = await apiRequest("DELETE", `/api/friends/${friendId}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      toast({
        title: "Friend removed",
        description: "Successfully removed from your friends list",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Couldn't remove friend",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const respondToRequestMutation = useMutation({
    mutationFn: async ({ requestId, status }) => {
      const res = await apiRequest(
        "POST",
        `/api/friends/request/${requestId}/respond`,
        { status }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      return res.json();
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
      toast({
        title: status === 'accepted' ? "Friend request accepted! 🎉" : "Friend request declined",
        description: status === 'accepted' 
          ? "You're now friends! Start chatting and training together."
          : "The friend request has been declined.",
        variant: "default",
      });
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

  const handleRemoveFriend = (friend) => {
    removeFriendMutation.mutate(friend.friendshipId);
  };

  const handleMessageFriend = (friend) => {
    // Implement messaging functionality
    toast({
      title: "Coming soon!",
      description: "Direct messaging will be available soon.",
      variant: "default",
    });
  };

  const filteredFriends = friends.filter((friend) =>
    friend.username.toLowerCase().includes(friendSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Friend Requests Section */}
      <AnimatePresence>
        {pendingRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-semibold flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Friend Requests ({pendingRequests.length})
                </h3>
              </div>
              <div className="p-2 space-y-2">
                {pendingRequests.map((request) => (
                  <FriendRequestCard
                    key={request.id}
                    request={request}
                    onAccept={handleAcceptRequest}
                    onReject={handleRejectRequest}
                  />
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Friends List Section */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Friends ({friends.length})
            </h3>
            <AddFriendDialog />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search friends..."
              value={friendSearchQuery}
              onChange={(e) => setFriendSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <motion.div
          className="p-2 space-y-2"
          layout
        >
          {filteredFriends.map((friend) => (
            <FriendCard 
              key={friend.friendshipId} 
              friend={friend}
              onRemove={handleRemoveFriend}
              onMessage={handleMessageFriend}
            />
          ))}
          {filteredFriends.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-muted-foreground"
            >
              {friends.length === 0 ? (
                <>
                  <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No friends yet. Start by adding some friends!</p>
                  <p className="text-sm mt-2 opacity-80">
                    Connect with others to share your progress and stay motivated.
                  </p>
                </>
              ) : (
                <>
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No friends found matching your search.</p>
                </>
              )}
            </motion.div>
          )}
        </motion.div>
      </Card>
    </div>
  );
}