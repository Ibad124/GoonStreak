import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  User, Users, Trophy, Target, ArrowRight, ArrowLeft, 
  Sparkles, Ghost, Crown, Medal, Brain, Heart, Coffee, 
  Sun, Moon, Zap 
} from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import type { ThemeStyle, ThemePreferences } from "@/types/theme";

const OnboardingPage = () => {
  return (
    <div className="container mx-auto px-4">
      <h1>Welcome to Onboarding</h1>
    </div>
  );
};

export default OnboardingPage;