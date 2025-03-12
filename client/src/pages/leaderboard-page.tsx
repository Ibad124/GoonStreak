import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, Crown, Medal } from "lucide-react";
import { type User } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

function getRankIcon(index: number) {
  switch (index) {
    case 0:
      return <Crown className="h-5 w-5 text-yellow-500" />;
    case 1:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 2:
      return <Medal className="h-5 w-5 text-amber-600" />;
    default:
      return null;
  }
}

export default function LeaderboardPage() {
  const { data: leaderboard, isLoading } = useQuery<User[]>({
    queryKey: ["/api/leaderboard"],
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon" className="mr-4">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Leaderboard</h1>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Rank</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Current Streak</TableHead>
              <TableHead className="text-right">Longest Streak</TableHead>
              <TableHead className="text-right">Total Sessions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              leaderboard?.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      {getRankIcon(index)}
                      <span className="ml-2">{index + 1}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.isAnonymous ? "Anonymous User" : user.username}
                  </TableCell>
                  <TableCell className="text-right">{user.currentStreak}</TableCell>
                  <TableCell className="text-right">{user.longestStreak}</TableCell>
                  <TableCell className="text-right">{user.totalSessions}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
