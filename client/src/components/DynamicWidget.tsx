import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/hooks/use-theme";
import { WIDGET_TYPES, WIDGET_CONFIG, type WidgetType } from "@shared/schema";
import { Loader2 } from "lucide-react";

interface WidgetProps {
  type: WidgetType;
  data: any;
  isLoading?: boolean;
  error?: Error | null;
  onRefresh?: () => void;
}

const widgetAnimations = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

export const DynamicWidget: React.FC<WidgetProps> = ({
  type,
  data,
  isLoading,
  error,
  onRefresh
}) => {
  const { preferences } = useTheme();
  const style = themeStyles[preferences.goonStyle || "default"];
  const config = WIDGET_CONFIG[type];

  if (error) {
    return (
      <motion.div
        variants={widgetAnimations}
        initial="initial"
        animate="animate"
        exit="exit"
        whileHover="hover"
        whileTap="tap"
      >
        <Card className={`${style.cardBg} backdrop-blur ${style.border} hover:bg-black/30 transition-all duration-300`}>
          <CardContent className="p-6">
            <p className={`text-sm ${style.text} opacity-80`}>
              Failed to load widget: {error.message}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <motion.div
        variants={widgetAnimations}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Card className={`${style.cardBg} backdrop-blur ${style.border}`}>
          <CardContent className="p-6 flex items-center justify-center">
            <Loader2 className={`h-6 w-6 animate-spin ${style.accent}`} />
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const renderWidgetContent = () => {
    switch (type) {
      case WIDGET_TYPES.STREAK_TRACKER:
        return (
          <div className="space-y-4">
            <div className={`text-4xl font-bold ${style.text}`}>
              {data.currentStreak} 🔥
            </div>
            <p className={`${style.text} opacity-80`}>
              Current Streak
            </p>
          </div>
        );

      case WIDGET_TYPES.GOAL_PROGRESS:
        return (
          <div className="space-y-4">
            {data.goals.map((goal: any) => (
              <div key={goal.id} className="space-y-2">
                <div className="flex justify-between">
                  <span className={style.text}>{goal.name}</span>
                  <span className={`${style.text} opacity-80`}>
                    {goal.current}/{goal.target}
                  </span>
                </div>
                <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${style.button}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(goal.current / goal.target) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <p className={`${style.text} opacity-80`}>
            Widget type not implemented
          </p>
        );
    }
  };

  return (
    <motion.div
      variants={widgetAnimations}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover="hover"
      whileTap="tap"
      style={{
        gridColumn: `span ${config.defaultSize.w}`,
        gridRow: `span ${config.defaultSize.h}`,
      }}
    >
      <Card className={`h-full ${style.cardBg} backdrop-blur ${style.border} hover:bg-black/30 transition-all duration-300`}>
        <CardContent className="p-6">
          {renderWidgetContent()}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const themeStyles = {
  default: {
    cardBg: "bg-white/80",
    text: "text-zinc-900",
    accent: "text-blue-500",
    button: "from-blue-500 to-blue-600",
    border: "border-zinc-200/50",
  },
  solo: {
    cardBg: "bg-black/20",
    text: "text-zinc-100",
    accent: "text-emerald-500",
    button: "from-emerald-500 to-emerald-600",
    border: "border-white/10",
  },
  competitive: {
    cardBg: "bg-black/20",
    text: "text-pink-100",
    accent: "text-pink-500",
    button: "from-pink-500 to-purple-500",
    border: "border-white/10",
  },
  hardcore: {
    cardBg: "bg-black/20",
    text: "text-red-100",
    accent: "text-red-500",
    button: "from-red-500 to-red-600",
    border: "border-white/10",
  },
};

export default DynamicWidget;