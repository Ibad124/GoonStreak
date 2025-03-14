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
      setIsVisible(true);
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
      desktop: "bottom-full mb-2",
      mobile: "bottom-[120%] mb-2 left-1/2 -translate-x-1/2"
    },
    bottom: {
      desktop: "top-full mt-2",
      mobile: "top-[120%] mt-2 left-1/2 -translate-x-1/2"
    },
    left: {
      desktop: "right-full mr-2",
      mobile: "top-full mt-2 left-1/2 -translate-x-1/2"
    },
    right: {
      desktop: "left-full ml-2",
      mobile: "top-full mt-2 left-1/2 -translate-x-1/2"
    }
  };

  const arrowStyles = {
    top: {
      desktop: "bottom-[-6px] border-t-blue-500",
      mobile: "bottom-[-6px] left-1/2 -translate-x-1/2 border-t-blue-500"
    },
    bottom: {
      desktop: "top-[-6px] border-b-blue-500",
      mobile: "top-[-6px] left-1/2 -translate-x-1/2 border-b-blue-500"
    },
    left: {
      desktop: "right-[-6px] border-l-blue-500",
      mobile: "top-[-6px] left-1/2 -translate-x-1/2 border-b-blue-500"
    },
    right: {
      desktop: "left-[-6px] border-r-blue-500",
      mobile: "top-[-6px] left-1/2 -translate-x-1/2 border-b-blue-500"
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
            className={`
              absolute z-50 
              hidden md:block md:${positionStyles[position].desktop}
              md:w-72 bg-gradient-to-br from-blue-500 to-blue-600 
              rounded-lg shadow-lg px-4 py-3 text-white

              md:transform-none
              fixed bottom-4 left-4 right-4 block
              md:static
            `}
          >
            {/* Arrow */}
            <div className={`
              absolute w-3 h-3 transform rotate-45 bg-blue-500
              hidden md:block md:${arrowStyles[position].desktop}
            `} />

            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm md:text-base">{title}</h4>
                <p className="text-xs md:text-sm text-blue-100 mt-1 line-clamp-3 md:line-clamp-none">
                  {description}
                </p>
                {step && totalSteps > 1 && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-blue-100">
                    <div className="flex-1 h-1 bg-blue-400/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white" 
                        style={{ width: `${(step / totalSteps) * 100}%` }}
                      />
                    </div>
                    <span className="whitespace-nowrap">Step {step}/{totalSteps}</span>
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}