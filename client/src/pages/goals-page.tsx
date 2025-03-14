import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Target,
  Brain,
  Heart,
  Trophy,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const goals = [
  {
    id: "focus",
    title: "Improve Focus",
    description: "Enhance concentration and productivity",
    icon: Brain,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "health",
    title: "Better Health",
    description: "Develop healthier daily routines",
    icon: Heart,
    color: "from-red-500 to-pink-500",
  },
  {
    id: "achievement",
    title: "Personal Growth",
    description: "Achieve personal milestones",
    icon: Trophy,
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: "discipline",
    title: "Build Discipline",
    description: "Strengthen self-control and habits",
    icon: Target,
    color: "from-purple-500 to-indigo-500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

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

export default function GoalsPage() {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  const saveGoalsMutation = useMutation({
    mutationFn: async (goals: string[]) => {
      const res = await apiRequest("POST", "/api/user/goals", { goals });
      return res.json();
    },
    onSuccess: () => {
      navigate("/");
    },
  });

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleNext = () => {
    setDirection(1);
    setStep(2);
  };

  const handleBack = () => {
    setDirection(-1);
    setStep(1);
  };

  const handleComplete = () => {
    saveGoalsMutation.mutate(selectedGoals);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 ? (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-4xl font-bold mb-4">Welcome aboard, {user?.username}! 🎉</h1>
                <p className="text-xl text-muted-foreground">
                  Let's personalize your journey. What goals would you like to achieve?
                </p>
              </motion.div>

              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {goals.map((goal) => (
                  <motion.div key={goal.id} variants={itemVariants}>
                    <Card
                      className={`p-6 cursor-pointer transition-all duration-300 ${
                        selectedGoals.includes(goal.id)
                          ? "ring-2 ring-primary ring-offset-2"
                          : "hover:shadow-lg"
                      }`}
                      onClick={() => toggleGoal(goal.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${goal.color}`}>
                          <goal.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">{goal.title}</h3>
                          <p className="text-muted-foreground">{goal.description}</p>
                        </div>
                        {selectedGoals.includes(goal.id) && (
                          <CheckCircle2 className="h-6 w-6 text-primary" />
                        )}
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
                  disabled={selectedGoals.length === 0}
                  className="group"
                >
                  Continue
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-3xl font-bold mb-4">Great Choices! 🌟</h2>
                <p className="text-xl text-muted-foreground">
                  You're all set to begin your journey. We'll help you track and achieve these goals.
                </p>
              </motion.div>

              <motion.div
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {selectedGoals.map((goalId) => {
                  const goal = goals.find((g) => g.id === goalId)!;
                  return (
                    <motion.div
                      key={goal.id}
                      variants={itemVariants}
                      className={`p-4 rounded-lg bg-gradient-to-r ${goal.color} text-white`}
                    >
                      <div className="flex items-center gap-3">
                        <goal.icon className="h-6 w-6" />
                        <span className="font-semibold">{goal.title}</span>
                      </div>
                    </motion.div>
                  );
                })}
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
                  disabled={saveGoalsMutation.isPending}
                  className="group"
                >
                  {saveGoalsMutation.isPending ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    </motion.div>
                  ) : (
                    <>
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
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
