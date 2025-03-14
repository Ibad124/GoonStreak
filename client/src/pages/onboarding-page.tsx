import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  User,
  Users,
  Trophy,
  Target,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Ghost,
  Crown,
  Medal,
} from "lucide-react";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

const goonStyles = [
  {
    id: "solo",
    title: "Solo Tracker",
    description: "I go solo, just tracking my progress.",
    icon: Ghost,
    color: "from-purple-500 to-indigo-500"
  },
  {
    id: "competitive",
    title: "Competitive Spirit",
    description: "I love competing with friends!",
    icon: Trophy,
    color: "from-yellow-500 to-orange-500"
  },
  {
    id: "hardcore",
    title: "Record Breaker",
    description: "I want to break records & hit insane streaks!",
    icon: Crown,
    color: "from-red-500 to-pink-500"
  }
];

const gameStyles = [
  {
    id: "casual",
    title: "Casual",
    description: "Just tracking progress",
    icon: Target,
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "competitive",
    title: "Competitive",
    description: "Beat friends & rank up",
    icon: Medal,
    color: "from-yellow-500 to-orange-500"
  },
  {
    id: "extreme",
    title: "Extreme Streaker",
    description: "Longest streaks possible",
    icon: Trophy,
    color: "from-red-500 to-pink-500"
  }
];

const socialPreferences = [
  {
    id: "solo",
    title: "Solo Mode",
    description: "No leaderboards, just personal stats",
    icon: User,
    color: "from-purple-500 to-indigo-500"
  },
  {
    id: "friends",
    title: "Friends Mode",
    description: "Compete against friends!",
    icon: Users,
    color: "from-green-500 to-emerald-500"
  },
  {
    id: "global",
    title: "Global Mode",
    description: "See top streakers worldwide",
    icon: Trophy,
    color: "from-yellow-500 to-orange-500"
  }
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [goonStyle, setGoonStyle] = useState("");
  const [gameStyle, setGameStyle] = useState("");
  const [socialMode, setSocialMode] = useState("");
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const userForm = useForm({
    resolver: zodResolver(insertUserSchema),
  });

  const savePreferencesMutation = useMutation({
    mutationFn: async (preferences: any) => {
      const res = await apiRequest("POST", "/api/user/preferences", preferences);
      return res.json();
    },
    onSuccess: () => {
      setLocation("/onboarding/goals");
    },
  });

  const handleNext = () => {
    setDirection(1);
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setDirection(-1);
    setStep(prev => prev - 1);
  };

  const handleComplete = () => {
    savePreferencesMutation.mutate({
      goonStyle,
      gameStyle,
      socialMode
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
            >
              <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-4xl font-bold mb-4">Welcome Aboard! 🎉</h1>
                <p className="text-xl text-muted-foreground">
                  First, tell us how you like to track your progress
                </p>
              </motion.div>

              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {goonStyles.map((style, index) => (
                  <motion.div
                    key={style.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className={`p-6 cursor-pointer transition-all duration-300 ${
                        goonStyle === style.id
                          ? "ring-2 ring-primary ring-offset-2"
                          : "hover:shadow-lg"
                      }`}
                      onClick={() => setGoonStyle(style.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${style.color}`}>
                          <style.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">{style.title}</h3>
                          <p className="text-muted-foreground">{style.description}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                className="mt-8 flex justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  size="lg"
                  onClick={handleNext}
                  disabled={!goonStyle}
                  className="group"
                >
                  Continue
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
            >
              <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-4xl font-bold mb-4">Set Your Goals 🎯</h1>
                <p className="text-xl text-muted-foreground">
                  How would you like to approach your journey?
                </p>
              </motion.div>

              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {gameStyles.map((style, index) => (
                  <motion.div
                    key={style.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className={`p-6 cursor-pointer transition-all duration-300 ${
                        gameStyle === style.id
                          ? "ring-2 ring-primary ring-offset-2"
                          : "hover:shadow-lg"
                      }`}
                      onClick={() => setGameStyle(style.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${style.color}`}>
                          <style.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">{style.title}</h3>
                          <p className="text-muted-foreground">{style.description}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                className="mt-8 flex justify-between"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleBack}
                  className="group"
                >
                  <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
                  Back
                </Button>
                <Button
                  size="lg"
                  onClick={handleNext}
                  disabled={!gameStyle}
                  className="group"
                >
                  Continue
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
            >
              <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-4xl font-bold mb-4">Choose Your Community 🌟</h1>
                <p className="text-xl text-muted-foreground">
                  How would you like to connect with others?
                </p>
              </motion.div>

              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {socialPreferences.map((pref, index) => (
                  <motion.div
                    key={pref.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className={`p-6 cursor-pointer transition-all duration-300 ${
                        socialMode === pref.id
                          ? "ring-2 ring-primary ring-offset-2"
                          : "hover:shadow-lg"
                      }`}
                      onClick={() => setSocialMode(pref.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${pref.color}`}>
                          <pref.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">{pref.title}</h3>
                          <p className="text-muted-foreground">{pref.description}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                className="mt-8 flex justify-between"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleBack}
                  className="group"
                >
                  <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
                  Back
                </Button>
                <Button
                  size="lg"
                  onClick={handleComplete}
                  disabled={!socialMode || savePreferencesMutation.isPending}
                  className="group"
                >
                  {savePreferencesMutation.isPending ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    </motion.div>
                  ) : (
                    <>
                      Continue to Goal Setting
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </motion.div>
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
