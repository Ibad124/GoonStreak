
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  User, Users, Trophy, Target, ArrowRight, ArrowLeft, 
  Sparkles, Ghost, Crown, Medal, Brain, Heart, Coffee, 
  Sun, Moon, Zap 
} from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import type { ThemeStyle, ThemePreferences } from "@/types/theme";

const slides = [
  {
    title: "Welcome to Your Journey",
    description: "Let's set up your experience to match your goals and preferences.",
    icon: Sparkles
  },
  {
    title: "Choose Your Style",
    description: "Pick a theme that resonates with your personality.",
    icon: Crown
  },
  {
    title: "Set Your Goals",
    description: "What would you like to achieve?",
    icon: Target
  },
  {
    title: "Ready to Begin",
    description: "Your personalized experience awaits!",
    icon: Zap
  }
];

const themeStyles: ThemeStyle[] = [
  { id: "minimal", name: "Minimal", icon: Sun },
  { id: "competitive", name: "Competitive", icon: Trophy },
  { id: "focused", name: "Focused", icon: Brain },
  { id: "casual", name: "Casual", icon: Heart }
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedStyle, setSelectedStyle] = useState<ThemeStyle["id"]>("minimal");

  const updatePreferences = useMutation({
    mutationFn: (preferences: ThemePreferences) =>
      apiRequest("/api/user/preferences", {
        method: "POST",
        body: preferences,
      }),
    onSuccess: () => {
      toast({
        title: "Preferences saved!",
        description: "Your theme has been updated.",
      });
      navigate("/");
    },
  });

  const handleNext = () => {
    if (step === slides.length - 1) {
      updatePreferences.mutate({ themeStyle: selectedStyle });
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container max-w-screen-md mx-auto px-4 py-12">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="text-center">
              <motion.div
                className="inline-block mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
              >
                {React.createElement(slides[step].icon, {
                  className: "w-12 h-12 text-indigo-500"
                })}
              </motion.div>
              <h1 className="text-3xl font-bold mb-2">{slides[step].title}</h1>
              <p className="text-zinc-600">{slides[step].description}</p>
            </div>

            {step === 1 && (
              <div className="grid grid-cols-2 gap-4">
                {themeStyles.map((style) => (
                  <Card
                    key={style.id}
                    className={`p-6 cursor-pointer transition-all ${
                      selectedStyle === style.id
                        ? "ring-2 ring-indigo-500 bg-indigo-50"
                        : "hover:bg-zinc-50"
                    }`}
                    onClick={() => setSelectedStyle(style.id)}
                  >
                    <div className="flex items-center gap-3">
                      {React.createElement(style.icon, {
                        className: "w-5 h-5 text-indigo-500"
                      })}
                      <span className="font-medium">{style.name}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-8">
              {step > 0 ? (
                <Button variant="ghost" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div />
              )}
              <Button onClick={handleNext}>
                {step === slides.length - 1 ? "Get Started" : "Continue"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
