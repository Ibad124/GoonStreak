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
import { Loader2, Timer, Clock, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LogSessionModal({ isOpen, onClose, onSubmit, isPending }) {
  const [mode, setMode] = useState(null); // "timer" or "manual"
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
            <Button
              variant="outline"
              className="h-32 flex flex-col gap-2"
              onClick={() => setMode("timer")}
            >
              <Timer className="h-8 w-8" />
              <span>Start Timer</span>
            </Button>
            <Button
              variant="outline"
              className="h-32 flex flex-col gap-2"
              onClick={() => setMode("manual")}
            >
              <Clock className="h-8 w-8" />
              <span>Log Past Session</span>
            </Button>
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
                <div className="text-4xl font-mono mb-4">{formatTime(time)}</div>
                <Button
                  variant={isRunning ? "destructive" : "default"}
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
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Mood</Label>
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relaxed">Relaxed</SelectItem>
                    <SelectItem value="energetic">Energetic</SelectItem>
                    <SelectItem value="focused">Focused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {mode && (
          <DialogFooter>
            <Button variant="ghost" onClick={() => setMode(null)}>
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isPending ||
                (mode === "timer" && time === 0) ||
                (mode === "manual" && !duration)
              }
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
