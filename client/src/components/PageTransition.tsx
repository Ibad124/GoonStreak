import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/use-theme";

interface PageTransitionProps {
  children: React.ReactNode;
  isVisible: boolean;
  onComplete: () => void;
}

const transitionVariants = {
  solo: {
    initial: {
      scale: 0,
      opacity: 0,
    },
    animate: {
      scale: [0, 1.2, 1],
      opacity: 1,
      transition: {
        duration: 1.5,
        ease: "easeInOut",
      },
    },
    exit: {
      scale: [1, 1.2, 0],
      opacity: 0,
      transition: {
        duration: 0.8,
      },
    },
  },
  competitive: {
    initial: {
      y: "100%",
      opacity: 0,
    },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 1,
        type: "spring",
        bounce: 0.4,
      },
    },
    exit: {
      y: "-100%",
      opacity: 0,
      transition: {
        duration: 0.6,
      },
    },
  },
  hardcore: {
    initial: {
      scale: 1.5,
      opacity: 0,
    },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 1.2,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: {
        duration: 0.8,
      },
    },
  },
  default: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
};

const welcomeMessages = {
  solo: "SYSTEM INITIALIZED. WELCOME TO YOUR TRAINING GROUND, WARRIOR. 🤖",
  competitive: "Time to shine, superstar! Let's make some magic happen! ✨",
  hardcore: "The darkness welcomes you... Your journey begins now. 😈",
  default: "Welcome to your new journey! 🌟",
};

export const PageTransition = ({
  children,
  isVisible,
  onComplete,
}: PageTransitionProps) => {
  const { preferences } = useTheme();
  const style = preferences.goonStyle || "default";
  const variant = transitionVariants[style];
  const message = welcomeMessages[style];

  return (
    <AnimatePresence mode="wait" onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variant}
        >
          <div className={`absolute inset-0 ${
            style === "hardcore" 
              ? "bg-gradient-to-br from-purple-900 via-red-900 to-purple-900" 
              : style === "competitive"
              ? "bg-gradient-to-br from-pink-400 via-purple-400 to-pink-400"
              : style === "solo"
              ? "bg-gradient-to-br from-red-500 via-orange-600 to-red-500"
              : "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500"
          }`} />
          
          <motion.div
            className="relative text-white text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-4">{message}</h1>
            {children}
          </motion.div>

          {/* Character-specific effects */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {style === "competitive" && (
              <motion.div
                className="absolute inset-0"
                animate={{
                  background: [
                    "radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)",
                    "radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 80%)",
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            {style === "hardcore" && (
              <motion.div
                className="absolute inset-0"
                animate={{
                  background: [
                    "radial-gradient(circle at 50% 50%, rgba(220, 38, 38, 0.4) 0%, transparent 50%)",
                    "radial-gradient(circle at 50% 50%, rgba(220, 38, 38, 0.4) 0%, transparent 80%)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            {style === "solo" && (
              <>
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute bg-orange-500/30 w-1 h-20"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      height: ["20px", "40px", "20px"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
