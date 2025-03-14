import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { DynamicWidget } from "./DynamicWidget";
import { WIDGET_TYPES, type WidgetType } from "@shared/schema";

interface WidgetContainerProps {
  userId: number;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({ userId }) => {
  const { data: widgetPreferences, isLoading: preferencesLoading } = useQuery({
    queryKey: ["/api/widget-preferences"],
  });

  const { data: goals, isLoading: goalsLoading } = useQuery({
    queryKey: ["/api/goals"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  if (preferencesLoading || goalsLoading || statsLoading) {
    return null;
  }

  // Default widgets if no preferences are set
  const visibleWidgets = widgetPreferences?.visibleWidgets || [
    WIDGET_TYPES.STREAK_TRACKER,
    WIDGET_TYPES.GOAL_PROGRESS,
    WIDGET_TYPES.PERSONAL_STATS,
  ];

  return (
    <div className="grid grid-cols-6 gap-4">
      <AnimatePresence mode="popLayout">
        {visibleWidgets.map((widgetType: WidgetType) => (
          <DynamicWidget
            key={widgetType}
            type={widgetType}
            data={{
              currentStreak: stats?.user?.currentStreak,
              goals: goals || [],
              ...stats,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default WidgetContainer;
