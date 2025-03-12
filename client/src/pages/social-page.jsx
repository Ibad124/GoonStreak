import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  ChevronLeft, 
  Video, 
  Plus,
  Users,
  UserPlus,
  Settings,
  X
} from "lucide-react";
import FriendsList from "@/components/FriendsList";
import FriendActivity from "@/components/FriendActivity";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { useToast } from "@/hooks/use-toast";

export default function SocialPage() {
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const handleStartRoom = () => {
    toast({
      title: "Creating Room",
      description: "Setting up your circle session...",
    });
    // Room creation logic will go here
    setIsCreateRoomOpen(false);
  };

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
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full md:hidden">
                  <Users className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0">
                <SheetHeader className="p-4 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                  <SheetTitle className="text-xl font-bold text-white">Friends</SheetTitle>
                </SheetHeader>
                <div className="p-4">
                  <FriendsList />
                </div>
              </SheetContent>
            </Sheet>
            <Drawer>
              <DrawerTrigger asChild>
                <Button className="rounded-full">
                  <Video className="h-4 w-4 mr-2" />
                  Start Circle
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Create Circle Session</DrawerTitle>
                </DrawerHeader>
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Session Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter session name..."
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Invite Friends</label>
                    <div className="grid grid-cols-2 gap-2">
                      {/* Friend selection UI will go here */}
                      <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                        <UserPlus className="h-6 w-6" />
                        <span className="text-xs">Add Friend</span>
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Session Settings</label>
                    <Card>
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            <span className="text-sm">Private Session</span>
                          </div>
                          <Button variant="ghost" size="sm">
                            Configure
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleStartRoom}
                  >
                    Start Session
                  </Button>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Friends List (Desktop) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden lg:block"
          >
            <Card className="backdrop-blur bg-white/80 border-zinc-200/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Friends</span>
                  <Button variant="ghost" size="icon">
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FriendsList />
              </CardContent>
            </Card>
          </motion.div>

          {/* Center Column - Active Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="backdrop-blur bg-white/80 border-zinc-200/50">
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="p-8 text-center text-muted-foreground">
                  <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>No active sessions</p>
                  <p className="text-sm mt-2">Start a circle session to connect with friends</p>
                </div>
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6"
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
          </motion.div>
        </div>
      </main>
    </div>
  );
}