import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { format, isSameDay } from "date-fns";

export default function SessionCalendar({ sessions, currentStreak }) {
  const today = new Date();

  // Function to check if a date has sessions
  const hasSession = (date) => {
    return sessions?.some(session => 
      isSameDay(new Date(session.date), date)
    );
  };

  // Custom day content renderer
  const dayContent = (date) => {
    const isToday = isSameDay(date, today);
    const hasSessionOnDay = hasSession(date);

    return (
      <motion.div
        initial={false}
        animate={{ 
          scale: hasSessionOnDay ? 1 : 1,
          opacity: date.getMonth() === today.getMonth() ? 1 : 0.5 
        }}
        className="relative flex items-center justify-center w-full h-full"
      >
        <div
          className={`
            w-10 h-10 rounded-full flex items-center justify-center
            transition-all duration-200 relative
            ${isToday ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
            ${hasSessionOnDay 
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20' 
              : 'hover:bg-blue-50'}
          `}
        >
          {format(date, "d")}
          {hasSessionOnDay && (
            <motion.div
              className="absolute -bottom-1 -right-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 500,
                damping: 25
              }}
            >
              <Flame className="h-4 w-4 text-orange-500 drop-shadow" />
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <Card className="backdrop-blur bg-white/80 border-zinc-200/50 shadow-lg shadow-blue-900/5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-blue-500" />
          Activity Calendar
        </CardTitle>
        {currentStreak > 0 && (
          <Badge 
            variant="secondary" 
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 gap-1 px-3 py-1"
          >
            <Flame className="h-4 w-4" />
            {currentStreak} day streak
          </Badge>
        )}
      </CardHeader>
      <CardContent>
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
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium",
            nav: "space-x-1 flex items-center",
            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-muted-foreground rounded-md w-10 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
            day: "h-10 w-10 p-0 font-normal",
            day_range_end: "day-range-end",
            day_selected: "bg-none text-white hover:bg-none hover:text-white focus:bg-none focus:text-white",
            day_today: "bg-none text-accent-foreground",
            day_outside: "opacity-50 aria-selected:bg-accent/50",
            day_disabled: "text-muted-foreground opacity-50",
            day_hidden: "invisible",
          }}
        />
      </CardContent>
    </Card>
  );
}