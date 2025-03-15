import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isSameDay } from "date-fns";

export default function SessionCalendar({ sessions = [], currentStreak }) {
  const today = new Date();

  // Function to check if a date has sessions
  const hasSession = (date) => {
    return sessions?.some(session => 
      isSameDay(new Date(session.timestamp), date)
    );
  };

  const dayContent = (date) => {
    const isToday = isSameDay(date, today);
    const hasSessionOnDay = hasSession(date);
    const isCurrentMonth = date.getMonth() === today.getMonth();

    return (
      <motion.div
        initial={false}
        animate={{ 
          scale: hasSessionOnDay ? 1 : 1,
          opacity: isCurrentMonth ? 1 : 0.5 
        }}
        className="relative flex items-center justify-center w-full h-full"
      >
        <motion.div
          className={`
            w-10 h-10 rounded-xl flex items-center justify-center
            transition-all duration-300 relative group
            ${isToday ? 'ring-2 ring-pink-500 ring-offset-2' : ''}
            ${hasSessionOnDay 
              ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg hover:shadow-xl' 
              : 'hover:bg-pink-500/5'}
          `}
          whileHover={!hasSessionOnDay ? { scale: 1.1 } : {}}
          whileTap={!hasSessionOnDay ? { scale: 0.95 } : {}}
        >
          <span className={`text-sm font-medium ${hasSessionOnDay ? 'text-white' : ''}`}>
            {format(date, "d")}
          </span>

          {hasSessionOnDay && (
            <AnimatePresence>
              <motion.div
                className="absolute -bottom-1 -right-1 bg-orange-500 rounded-full p-1 shadow-lg"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 500,
                  damping: 25
                }}
              >
                <Flame className="h-3 w-3 text-white" />
              </motion.div>
            </AnimatePresence>
          )}

          {/* Pulse effect for session days */}
          {hasSessionOnDay && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"
              initial={false}
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0, 0.2, 0] 
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Streak Badge */}
      <AnimatePresence>
        {currentStreak > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Badge 
              variant="secondary" 
              className="
                w-full py-3 justify-center gap-2
                bg-gradient-to-r from-pink-500 to-purple-600 
                text-white border-0 text-sm font-medium
                shadow-lg shadow-pink-500/20
                hover:from-pink-600 hover:to-purple-700
                transition-all duration-300
              "
            >
              <Flame className="h-4 w-4 animate-pulse" />
              <span>{currentStreak} Day Streak</span>
              {currentStreak >= 7 && (
                <motion.div
                  className="absolute inset-0 bg-white/10 rounded-lg"
                  animate={{
                    opacity: [0, 0.2, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-xl p-4 shadow-lg backdrop-blur-sm border border-slate-700/50"
      >
        <Calendar
          mode="single"
          selected={today}
          className="rounded-md"
          components={{
            DayContent: ({ date }) => dayContent(date)
          }}
          classNames={{
            months: "space-y-4",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center mb-4",
            caption_label: "text-base font-semibold text-slate-100",
            nav: "space-x-1 flex items-center",
            nav_button: "h-7 w-7 bg-transparent p-0 hover:bg-pink-500/5 rounded-lg transition-colors text-slate-300",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse",
            head_row: "flex",
            head_cell: "text-slate-400 rounded-md w-10 font-medium text-[0.8rem] h-10 flex items-center justify-center",
            row: "flex w-full mt-2",
            cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 text-slate-300",
            day: "h-10 w-10 p-0 font-normal",
            day_selected: "bg-transparent",
            day_today: "bg-transparent",
            day_outside: "opacity-50",
            day_disabled: "text-slate-500 opacity-50",
            day_hidden: "invisible",
          }}
        />
      </motion.div>
    </div>
  );
}