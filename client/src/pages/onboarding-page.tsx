import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useMutation } from "@tanstack/react-query";
import {
  User,
  Users,
  Trophy,
  Target,
  ArrowRight,
  ArrowLeft,
  Ghost,
  Crown,
  Sun,
  Moon,
  Zap,
} from "lucide-react";

const goonStyles = [
  {
    id: "solo",
    title: "Solo Tracker",
    description: "Track your progress in solitude.",
    icon: Ghost,
    color: "bg-emerald-500",
  },
  {
    id: "competitive",
    title: "Competitive Spirit",
    description: "Compete with friends and climb the ranks!",
    icon: Trophy,
    color: "bg-fuchsia-500",
  },
  {
    id: "hardcore",
    title: "Ultimate Achiever",
    description: "Push beyond limits, break records!",
    icon: Crown,
    color: "bg-rose-500",
  }
];

const timePreferences = [
  {
    id: "morning",
    title: "Early Bird",
    description: "Most productive in the morning",
    icon: Sun,
    color: "bg-amber-500"
  },
  {
    id: "night",
    title: "Night Owl",
    description: "Peak performance at night",
    icon: Moon,
    color: "bg-indigo-500"
  }
];

const intensityLevels = [
  {
    id: "casual",
    title: "Steady Pace",
    description: "Build habits consistently",
    icon: Target,
    color: "bg-blue-500"
  },
  {
    id: "intense",
    title: "Maximum Effort",
    description: "Push to your limits",
    icon: Zap,
    color: "bg-red-500"
  }
];

const socialModes = [
  {
    id: "private",
    title: "Private Journey",
    description: "Focus on personal growth",
    icon: User,
    color: "bg-purple-500"
  },
  {
    id: "social",
    title: "Community Spirit",
    description: "Share and compete with others",
    icon: Users,
    color: "bg-green-500"
  }
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [goonStyle, setGoonStyle] = useState("");
  const [timePreference, setTimePreference] = useState("");
  const [intensityLevel, setIntensityLevel] = useState("");
  const [socialMode, setSocialMode] = useState("");
  const [, setLocation] = useLocation();
  const { updatePreferences } = useTheme();

  const handleComplete = async () => {
    try {
      await updatePreferences({
        goonStyle: goonStyle as any,
        timePreference,
        intensityLevel,
        socialMode
      });

      // Use a smooth transition with setTimeout
      setTimeout(() => {
        setLocation("/");
      }, 500);
    } catch (error) {
      console.error("Failed to save preferences:", error);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold">Choose Your Style</h1>
              <p className="text-lg text-muted-foreground mt-2">How do you want to approach your journey?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {goonStyles.map((style) => (
                <motion.div
                  key={style.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card
                    className={`p-6 cursor-pointer transition-all ${
                      goonStyle === style.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setGoonStyle(style.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${style.color}`}>
                        <style.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{style.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {style.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold">Peak Performance Time</h1>
              <p className="text-lg text-muted-foreground mt-2">When are you most productive?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {timePreferences.map((pref) => (
                <motion.div
                  key={pref.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card
                    className={`p-6 cursor-pointer transition-all ${
                      timePreference === pref.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setTimePreference(pref.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${pref.color}`}>
                        <pref.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{pref.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {pref.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold">Challenge Level</h1>
              <p className="text-lg text-muted-foreground mt-2">How hard do you want to push yourself?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {intensityLevels.map((level) => (
                <motion.div
                  key={level.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card
                    className={`p-6 cursor-pointer transition-all ${
                      intensityLevel === level.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setIntensityLevel(level.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${level.color}`}>
                        <level.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{level.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {level.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold">Social Preferences</h1>
              <p className="text-lg text-muted-foreground mt-2">How would you like to interact with others?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {socialModes.map((mode) => (
                <motion.div
                  key={mode.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card
                    className={`p-6 cursor-pointer transition-all ${
                      socialMode === mode.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSocialMode(mode.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${mode.color}`}>
                        <mode.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{mode.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {mode.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/10" />

      <div className="container mx-auto px-4 py-12 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-4xl mx-auto"
          >
            {renderStep()}

            <motion.div
              className="mt-8 flex justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {step > 1 && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setStep(s => s - 1)}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              )}

              <div className="ml-auto">
                {step < 4 ? (
                  <Button
                    size="lg"
                    onClick={() => setStep(s => s + 1)}
                    disabled={!goonStyle || (step === 2 && !timePreference) || (step === 3 && !intensityLevel)}
                    className="gap-2"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={handleComplete}
                    disabled={!socialMode}
                    className="gap-2"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}