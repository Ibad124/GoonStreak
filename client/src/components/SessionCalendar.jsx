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
      <div className="relative w-full h-full p-2">
        <div
          className={`
            w-8 h-8 rounded-full flex items-center justify-center
            ${isToday ? 'border-2 border-blue-500' : ''}
            ${hasSessionOnDay ? 'bg-blue-500 text-white' : ''}
          `}
        >
          {format(date, "d")}
          {hasSessionOnDay && (
            <motion.div
              className="absolute -bottom-1 -right-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              <Flame className="h-4 w-4 text-orange-500" />
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="backdrop-blur bg-white/80 border-zinc-200/50 shadow-lg shadow-blue-900/5">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-blue-500" />
          Session Calendar
        </CardTitle>
        {currentStreak > 0 && (
          <Badge variant="secondary" className="bg-orange-100 text-orange-700 gap-1">
            <Flame className="h-4 w-4 text-orange-500" />
            {currentStreak} day streak
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={today}
          className="rounded-md border"
          components={{
            DayContent: ({ date }) => dayContent(date)
          }}
        />
      </CardContent>
    </Card>
  );
}
