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
import { ChevronLeft, Crown, Medal, Star, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const rankColors = {
  0: "bg-gradient-to-r from-yellow-500/20 to-transparent",
  1: "bg-gradient-to-r from-gray-400/20 to-transparent",
  2: "bg-gradient-to-r from-amber-600/20 to-transparent",
};

function getRankIcon(index) {
  switch (index) {
    case 0:
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
        >
          <Crown className="h-6 w-6 text-yellow-500" />
        </motion.div>
      );
    case 1:
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
        >
          <Medal className="h-6 w-6 text-gray-400" />
        </motion.div>
      );
    case 2:
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
        >
          <Medal className="h-6 w-6 text-amber-600" />
        </motion.div>
      );
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
          <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4" />
            <span>Weekly Reset in 3d 12h</span>
          </div>
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
                  <TableHead className="text-right">XP</TableHead>
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
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`${rankColors[index] || ""}`}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getRankIcon(index)}
                            <span className="ml-2">{index + 1}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>
                              {user.isAnonymous ? "Anonymous User" : user.username}
                            </span>
                            {user.level > 3 && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                              >
                                <Sparkles className="h-4 w-4 text-primary/60" />
                              </motion.div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {user.currentStreak}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {user.longestStreak}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {user.xpPoints}
                        </TableCell>
                      </motion.tr>
                    ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
}