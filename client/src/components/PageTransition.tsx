import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface PageTransitionProps {
  children: React.ReactNode;
  isVisible: boolean;
  onComplete: () => void;
}

const transitionVariants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    y: 0
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 1.2,
    y: -1000,
    transition: {
      duration: 0.8,
      ease: [0.65, 0, 0.35, 1],
    },
  },
};

const backgroundVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.6,
    },
  },
};

export const PageTransition = ({
  children,
  isVisible,
  onComplete,
}: PageTransitionProps) => {
  const { preferences } = useTheme();
  const style = preferences.goonStyle || "default";
  const [, setLocation] = useLocation();

  const getBackgroundStyle = () => {
    switch (style) {
      case "solo":
        return "bg-gradient-to-br from-red-900 via-orange-900 to-red-900";
      case "competitive":
        return "bg-gradient-to-br from-pink-400 via-purple-400 to-pink-400";
      case "hardcore":
        return "bg-gradient-to-br from-purple-900 via-red-900 to-purple-900";
      default:
        return "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500";
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={transitionVariants}
          onAnimationComplete={(definition) => {
            if (definition === "exit") {
              setTimeout(() => {
                onComplete();
              }, 100);
            }
          }}
        >
          <motion.div
            className={`absolute inset-0 ${getBackgroundStyle()}`}
            variants={backgroundVariants}
          />

          <motion.div 
            className="relative text-white text-center px-4"
            variants={{
              exit: {
                y: -100,
                opacity: 0,
                transition: { duration: 0.3 }
              }
            }}
          >
            {children}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                className="mt-4 relative group overflow-hidden rounded-full bg-white/10 hover:bg-white/20 text-white font-medium shadow-lg shadow-black/20 backdrop-blur px-8 py-3 border border-white/30"
                onClick={() => setLocation("/")}
              >
                <motion.span 
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"
                  animate={{
                    x: ["0%", "200%"]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <span className="relative flex items-center gap-2">
                  Skip Animation
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    →
                  </motion.div>
                </span>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};