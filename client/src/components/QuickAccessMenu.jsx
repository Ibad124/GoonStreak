import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Video,
  Users,
  Trophy,
  Settings,
  LogOut,
  Menu as MenuIcon,
  X
} from "lucide-react";

const menuItems = [
  { icon: Video, label: "Start Session", href: "/" },
  { icon: Users, label: "Friends", href: "/social" },
  { icon: Trophy, label: "Leaderboard", href: "/leaderboard" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function QuickAccessMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });

  const handleTouchStart = (e) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchEnd = (e) => {
    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    };

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;

    // Detect swipe direction
    if (Math.abs(deltaX) > 50) { // Horizontal swipe
      if (deltaX > 0) { // Right swipe
        setIsOpen(true);
      } else { // Left swipe
        setIsOpen(false);
      }
    }
  };

  return (
    <>
      {/* Gesture Area */}
      <div
        className="fixed left-0 top-0 w-16 h-full z-40"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      />

      {/* Menu Toggle Button */}
      <Button
        variant="default"
        size="icon"
        className="fixed left-4 top-1/2 -translate-y-1/2 z-40 h-12 w-12 rounded-full shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MenuIcon className="h-6 w-6 text-white" />
        )}
      </Button>

      {/* Quick Access Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-xl z-50 flex flex-col"
            >
              <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                <h2 className="text-xl font-bold">Quick Access</h2>
                <p className="text-sm text-blue-100">Swipe right to open</p>
              </div>

              <div className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => (
                  <Link key={item.label} href={item.href}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3"
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </div>

              <div className="p-4 border-t">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
