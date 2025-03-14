import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/use-theme";

interface PageTransitionProps {
  children: React.ReactNode;
  isVisible: boolean;
  onComplete: () => void;
}

const transitionVariants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 1.2,
    transition: {
      duration: 0.3,
      ease: "easeIn",
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
      duration: 0.2,
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
    <AnimatePresence mode="wait" onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={transitionVariants}
        >
          <motion.div
            className={`absolute inset-0 ${getBackgroundStyle()}`}
            variants={backgroundVariants}
          />

          <div className="relative text-white text-center px-4">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};