import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Loader2, Brain, Heart, Flame } from "lucide-react";

interface LogSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isPending: boolean;
}

export default function LogSessionModal({
  isOpen,
  onClose,
  onSubmit,
  isPending,
}: LogSessionModalProps) {
  const [intensity, setIntensity] = useState(5);
  const [mood, setMood] = useState(5);
  const [duration, setDuration] = useState(30);

  const handleSubmit = () => {
    onSubmit({
      duration,
      intensity,
      mood,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur border-purple-500/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-4">Log Session</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Duration Slider */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              Duration (minutes)
            </label>
            <Slider
              value={[duration]}
              onValueChange={([value]) => setDuration(value)}
              min={1}
              max={120}
              step={1}
              className="[&_[role=slider]]:bg-orange-500"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 min</span>
              <span className="font-medium text-orange-500">{duration} min</span>
              <span>120 min</span>
            </div>
          </div>

          {/* Intensity Slider */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              Intensity Level
            </label>
            <Slider
              value={[intensity]}
              onValueChange={([value]) => setIntensity(value)}
              min={1}
              max={10}
              step={1}
              className="[&_[role=slider]]:bg-purple-500"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Light</span>
              <span className="font-medium text-purple-500">Level {intensity}</span>
              <span>Intense</span>
            </div>
          </div>

          {/* Mood Slider */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500" />
              Mood Rating
            </label>
            <Slider
              value={[mood]}
              onValueChange={([value]) => setMood(value)}
              min={1}
              max={10}
              step={1}
              className="[&_[role=slider]]:bg-pink-500"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Poor</span>
              <span className="font-medium text-pink-500">{mood}/10</span>
              <span>Great</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Log Session"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
