import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Check, X, Search, Circle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function FriendRequestCard({ request, onAccept, onReject }) {
  const { otherUser } = request;
  
  return (
    <div className="flex items-center justify-between p-4 border-b last:border-0">
      <div>
        <h3 className="font-medium">{otherUser.username}</h3>
        <p className="text-sm text-muted-foreground">{otherUser.title}</p>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          className="rounded-full"
          onClick={() => onAccept(request.id)}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full"
          onClick={() => onReject(request.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function FriendCard({ friend }) {
  const isOnlineIndicator = friend.isOnline ? "bg-green-500" : "bg-zinc-300";
  const lastActive = friend.lastActive
    ? formatDistanceToNow(new Date(friend.lastActive), { addSuffix: true })
    : "Never";

  return (
    <div className="flex items-center justify-between p-4 border-b last:border-0">
      <div className="flex items-center gap-3">
        <div className={`h-2 w-2 rounded-full ${isOnlineIndicator}`} />
        <div>
          <h3 className="font-medium">{friend.username}</h3>
          <p className="text-sm text-muted-foreground">
            {friend.status || `Last active ${lastActive}`}
          </p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-medium">{friend.title}</div>
        <div className="text-xs text-muted-foreground">
          {friend.currentStreak} day streak
        </div>
      </div>
    </div>
  );
}

export default function FriendsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: friends = [] } = useQuery({
    queryKey: ["/api/friends"],
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["/api/friends/requests"],
  });

  const pendingRequests = requests.filter(
    (request) => request.status === "pending"
  );

  const sendRequestMutation = useMutation({
    mutationFn: async (receiverId) => {
      const res = await apiRequest("POST", "/api/friends/request", {
        receiverId,
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
      {/* Friend Requests Section */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
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
      )}

      {/* Friends List Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Friends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-full"
            />
          </div>
          <div className="divide-y">
            {friends
              .filter((friend) =>
                friend.username
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())
              )
              .map((friend) => (
                <FriendCard key={friend.friendshipId} friend={friend} />
              ))}
            {friends.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No friends yet. Start by adding some friends!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
