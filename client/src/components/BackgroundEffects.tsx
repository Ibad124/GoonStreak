import { motion } from "framer-motion";

interface BackgroundEffectsProps {
  style?: "default" | "solo" | "competitive" | "hardcore";
}

export function BackgroundEffects({ style = "default" }: BackgroundEffectsProps) {
  const variants = {
    solo: {
      className: "absolute inset-0 bg-gradient-to-br from-red-900/20 via-orange-900/10 to-red-900/20",
      patterns: (
        <motion.div 
          className="absolute inset-0 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-red-500/10 w-1 h-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 0.5, 0.2],
                height: ["20px", "40px", "20px"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </motion.div>
      ),
    },
    competitive: {
      className: "absolute inset-0 bg-gradient-to-br from-pink-400/20 via-purple-400/10 to-pink-400/20",
      patterns: (
        <motion.div 
          className="absolute inset-0 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-pink-500/10 rounded-full"
              style={{
                width: "100px",
                height: "100px",
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </motion.div>
      ),
    },
    hardcore: {
      className: "absolute inset-0 bg-gradient-to-br from-purple-900/30 via-red-900/20 to-purple-900/30",
      patterns: (
        <motion.div 
          className="absolute inset-0 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-red-500/10"
              style={{
                width: "200px",
                height: "200px",
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                borderRadius: "40%",
              }}
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </motion.div>
      ),
    },
    default: {
      className: "absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50",
      patterns: null,
    },
  };

  const variant = variants[style] || variants.default;

  return (
    <>
      <div className={variant.className} />
      {variant.patterns}
    </>
  );
}
