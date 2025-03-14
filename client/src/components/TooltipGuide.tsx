import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface TooltipGuideProps {
  id: string;
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
}

export function TooltipGuide({
  id,
  title,
  description,
  position = "bottom",
  children
}: TooltipGuideProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenSeen, setHasBeenSeen] = useState(false);

  useEffect(() => {
    // Check if the tooltip has been seen before
    const seenTooltips = JSON.parse(localStorage.getItem("seenTooltips") || "{}");
    if (!seenTooltips[id]) {
      setIsVisible(true);
    } else {
      setHasBeenSeen(true);
    }
  }, [id]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Store that this tooltip has been seen
    const seenTooltips = JSON.parse(localStorage.getItem("seenTooltips") || "{}");
    seenTooltips[id] = true;
    localStorage.setItem("seenTooltips", JSON.stringify(seenTooltips));
    setHasBeenSeen(true);
  };

  const positionStyles = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
    right: "left-full ml-2"
  };

  const arrowStyles = {
    top: "bottom-[-6px] border-t-blue-500",
    bottom: "top-[-6px] border-b-blue-500",
    left: "right-[-6px] border-l-blue-500",
    right: "left-[-6px] border-r-blue-500"
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
            className={`absolute ${positionStyles[position]} z-50 w-64 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg px-4 py-3 text-white`}
          >
            {/* Arrow */}
            <div className={`absolute w-3 h-3 transform rotate-45 bg-blue-500 ${arrowStyles[position]}`} />
            
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold text-sm">{title}</h4>
                <p className="text-xs text-blue-100 mt-1">{description}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-blue-600/50 text-white"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
