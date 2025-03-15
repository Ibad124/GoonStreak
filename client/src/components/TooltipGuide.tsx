import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, ChevronRight } from "lucide-react";

interface TooltipGuideProps {
  id: string;
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
  step?: number;
  totalSteps?: number;
  children: React.ReactNode;
}

export function TooltipGuide({
  id,
  title,
  description,
  position = "bottom",
  step = 1,
  totalSteps = 1,
  children
}: TooltipGuideProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenSeen, setHasBeenSeen] = useState(false);

  useEffect(() => {
    // Check if previous steps have been completed
    const seenTooltips = JSON.parse(localStorage.getItem("seenTooltips") || "{}");
    const previousStepsCompleted = Array.from({ length: step - 1 }, (_, i) => i + 1)
      .every(prevStep => seenTooltips[`step-${prevStep}`]);

    if (!seenTooltips[id] && (!step || previousStepsCompleted)) {
      // Delay showing tooltip slightly to ensure parent elements are rendered
      setTimeout(() => setIsVisible(true), 500);
    } else {
      setHasBeenSeen(true);
    }
  }, [id, step]);

  const handleDismiss = () => {
    setIsVisible(false);
    const seenTooltips = JSON.parse(localStorage.getItem("seenTooltips") || "{}");
    seenTooltips[id] = true;
    seenTooltips[`step-${step}`] = true;
    localStorage.setItem("seenTooltips", JSON.stringify(seenTooltips));
    setHasBeenSeen(true);
  };

  const positionStyles = {
    top: {
      desktop: "bottom-[120%] mb-2",
      mobile: "bottom-[120%] mb-2 left-1/2 -translate-x-1/2"
    },
    bottom: {
      desktop: "top-[120%] mt-2",
      mobile: "top-[120%] mt-2 left-1/2 -translate-x-1/2"
    },
    left: {
      desktop: "right-[120%] mr-2",
      mobile: "top-[120%] mt-2 left-1/2 -translate-x-1/2"
    },
    right: {
      desktop: "left-[120%] ml-2",
      mobile: "top-[120%] mt-2 left-1/2 -translate-x-1/2"
    }
  };

  return (
    <div className="relative group">
      {children}
      <AnimatePresence>
        {isVisible && !hasBeenSeen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: position === "top" ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={`
              fixed z-[100] w-72
              md:absolute md:w-80
              ${positionStyles[position].desktop}
              bg-gradient-to-br from-blue-500 to-blue-600 
              rounded-lg shadow-xl px-4 py-3 text-white
              border border-blue-400/20
              backdrop-blur-sm
            `}
          >
            {/* Content */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-base">{title}</h4>
                <p className="text-sm text-blue-100 mt-1">
                  {description}
                </p>
                {step && totalSteps > 1 && (
                  <div className="flex items-center gap-2 mt-3 text-xs text-blue-100">
                    <div className="flex-1 h-1 bg-blue-400/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white" 
                        style={{ width: `${(step / totalSteps) * 100}%` }}
                      />
                    </div>
                    <span>Step {step}/{totalSteps}</span>
                  </div>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-blue-600/50 text-white flex-shrink-0"
                onClick={handleDismiss}
              >
                {step && step < totalSteps ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Animated Pulse */}
            <motion.div
              className="absolute inset-0 rounded-lg bg-white/10"
              animate={{ 
                scale: [1, 1.02, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}