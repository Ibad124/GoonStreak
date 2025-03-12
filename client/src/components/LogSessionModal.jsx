import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Timer, Clock, CheckCircle, Activity, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LogSessionModal({ isOpen, onClose, onSubmit, isPending }) {
  const [mode, setMode] = useState(null);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [intensity, setIntensity] = useState("medium");
  const [mood, setMood] = useState("focused");
  const [duration, setDuration] = useState("");
  const timerRef = useRef();

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    const sessionData = {
      duration: mode === "timer" ? Math.floor(time / 60) : parseInt(duration),
      intensity,
      mood,
      timestamp: new Date(),
    };
    onSubmit(sessionData);
  };

  const resetForm = () => {
    setMode(null);
    setTime(0);
    setIsRunning(false);
    setIntensity("medium");
    setMood("focused");
    setDuration("");
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const intensityOptions = [
    { value: "low", label: "Low", icon: Activity, color: "text-green-500" },
    { value: "medium", label: "Medium", icon: Activity, color: "text-yellow-500" },
    { value: "high", label: "High", icon: Activity, color: "text-red-500" },
  ];

  const moodOptions = [
    { value: "relaxed", label: "Relaxed", icon: Heart, color: "text-blue-500" },
    { value: "energetic", label: "Energetic", icon: Heart, color: "text-purple-500" },
    { value: "focused", label: "Focused", icon: Heart, color: "text-indigo-500" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Session</DialogTitle>
          <DialogDescription>
            Choose how you'd like to log your session
          </DialogDescription>
        </DialogHeader>

        {!mode && (
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-0.5"
              onClick={() => setMode("timer")}
            >
              <div className="h-32 flex flex-col items-center justify-center gap-2 rounded-[calc(0.75rem-1px)] bg-white dark:bg-zinc-950">
                <Timer className="h-8 w-8 text-blue-500" />
                <span className="font-medium">Start Timer</span>
                <span className="text-xs text-muted-foreground">Track in real-time</span>
              </div>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-0.5"
              onClick={() => setMode("manual")}
            >
              <div className="h-32 flex flex-col items-center justify-center gap-2 rounded-[calc(0.75rem-1px)] bg-white dark:bg-zinc-950">
                <Clock className="h-8 w-8 text-blue-500" />
                <span className="font-medium">Log Past Session</span>
                <span className="text-xs text-muted-foreground">Enter manually</span>
              </div>
            </motion.button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {mode === "timer" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="relative inline-block">
                  <svg className="w-32 h-32">
                    <circle
                      className="text-muted stroke-current"
                      strokeWidth="4"
                      fill="none"
                      r="58"
                      cx="64"
                      cy="64"
                    />
                    <circle
                      className="text-blue-500 stroke-current"
                      strokeWidth="4"
                      fill="none"
                      r="58"
                      cx="64"
                      cy="64"
                      strokeDasharray="364.425"
                      strokeDashoffset={364.425 * (1 - (time % 60) / 60)}
                      transform="rotate(-90 64 64)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-2xl font-mono font-medium">{formatTime(time)}</div>
                  </div>
                </div>
                <Button
                  variant={isRunning ? "destructive" : "default"}
                  size="lg"
                  className="mt-4"
                  onClick={() => setIsRunning(!isRunning)}
                >
                  {isRunning ? "Stop" : "Start"}
                </Button>
              </div>
            </motion.div>
          )}

          {mode === "manual" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Enter duration in minutes"
                />
              </div>
            </motion.div>
          )}

          {mode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Intensity</Label>
                <Select value={intensity} onValueChange={setIntensity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {intensityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <option.icon className={`h-4 w-4 ${option.color}`} />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  How intense was your session?
                </p>
              </div>

              <div className="space-y-2">
                <Label>Mood</Label>
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {moodOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <option.icon className={`h-4 w-4 ${option.color}`} />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  How did you feel during the session?
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {mode && (
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setMode(null)}
              className="flex-1 sm:flex-none"
            >
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isPending ||
                (mode === "timer" && time === 0) ||
                (mode === "manual" && !duration)
              }
              className="flex-1 sm:flex-none"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Submit
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}