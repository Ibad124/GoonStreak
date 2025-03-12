import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft, Video, Plus } from "lucide-react";
import FriendsList from "@/components/FriendsList";
import FriendActivity from "@/components/FriendActivity";
import { motion } from "framer-motion";

export default function SocialPage() {
  return (
    <div className="min-h-screen bg-zinc-50/50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 z-50 border-b border-zinc-200/50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Social Hub</h1>
          </div>
          <Button className="rounded-full" onClick={() => alert("Coming soon!")}>
            <Video className="h-4 w-4 mr-2" />
            Start Circle
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Friends List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FriendsList />
          </motion.div>

          {/* Right Column - Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="backdrop-blur bg-white/80 border-zinc-200/50">
              <CardHeader>
                <CardTitle>Friend Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <FriendActivity />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
