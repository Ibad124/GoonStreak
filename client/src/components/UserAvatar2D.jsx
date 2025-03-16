import { motion } from "framer-motion";
import { useState } from "react";
import { Sparkles } from "lucide-react";

export default function UserAvatar2D({ level, mood = "happy", size = "md" }) {
  const [isHovered, setIsHovered] = useState(false);

  const sizes = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-24 h-24"
  };

  const getGradient = (level) => {
    if (level >= 50) return "from-purple-500 to-pink-500";
    if (level >= 30) return "from-blue-500 to-purple-500";
    if (level >= 10) return "from-green-500 to-blue-500";
    return "from-orange-500 to-red-500";
  };

  return (
    <motion.div
      className={`relative ${sizes[size]} rounded-full overflow-hidden cursor-pointer`}
      whileHover={{ scale: 1.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(level)}`} />
      
      {/* Level Badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute -top-1 -right-1 bg-black/40 backdrop-blur px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white border border-white/20"
      >
        {level}
      </motion.div>

      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"
        animate={{
          opacity: isHovered ? 0.8 : 0.4
        }}
      />

      {/* Sparkle Effect */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Sparkles className="w-6 h-6 text-white" />
        </motion.div>
      )}
    </motion.div>
  );
}
