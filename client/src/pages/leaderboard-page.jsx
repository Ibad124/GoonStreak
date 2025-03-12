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
import { Skeleton } from "@/components/ui/skeleton";

function getRankIcon(index) {
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
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["/api/leaderboard"],
  });

  return (
    <div className="min-h-screen">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur border-b z-50">
        <div className="container mx-auto px-4 h-14 flex items-center">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-4">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-semibold">Leaderboard</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-20">
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Streak</TableHead>
                  <TableHead className="text-right">Best</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
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
                  : leaderboard?.map((user, index) => (
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
                        <TableCell className="text-right">
                          {user.currentStreak}
                        </TableCell>
                        <TableCell className="text-right">
                          {user.longestStreak}
                        </TableCell>
                        <TableCell className="text-right">
                          {user.totalSessions}
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
}
