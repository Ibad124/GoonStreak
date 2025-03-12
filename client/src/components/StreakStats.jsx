import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, Trophy, Zap, Calendar, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow, format, startOfWeek, eachDayOfInterval, isToday } from "date-fns";

function StatCard({ icon, value, label }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="p-4 flex flex-col items-center bg-white/50 backdrop-blur border-zinc-200/50 hover:shadow-lg hover:shadow-blue-900/5 transition-all">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-2"
        >
          {icon}
        </motion.div>
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-semibold tracking-tight"
        >
          {value}
        </motion.div>
        <div className="text-sm text-zinc-500 font-medium">{label}</div>
      </Card>
    </motion.div>
  );
}

function StreakCalendar({ lastSessionDate }) {
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: today,
  });

  return (
    <div className="flex gap-1.5 justify-between mt-4">
      {weekDays.map((day, i) => {
        const isActive = lastSessionDate && 
          format(new Date(lastSessionDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');

        return (
          <motion.div
            key={i}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="flex flex-col items-center"
          >
            <div className="text-xs text-zinc-500 mb-1">
              {format(day, 'EEE')}
            </div>
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs
                ${isActive ? 'bg-blue-500 text-white' : 
                  isToday(day) ? 'border-2 border-blue-500/50' : 'bg-zinc-100'}
              `}
            >
              {format(day, 'd')}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function StreakStats({ stats }) {
  const { currentStreak, longestStreak, totalSessions, todaySessions, lastSessionDate } = stats.user;

  // Calculate next milestone
  const nextMilestone = Math.ceil(currentStreak / 5) * 5;
  const progressToMilestone = (currentStreak / nextMilestone) * 100;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={<Zap className="h-8 w-8 text-amber-500/90" />}
          value={currentStreak}
          label="Current Streak"
        />
        <StatCard
          icon={<Trophy className="h-8 w-8 text-blue-500/90" />}
          value={longestStreak}
          label="Best Streak"
        />
        <StatCard
          icon={<Star className="h-8 w-8 text-purple-500/90" />}
          value={totalSessions}
          label="Total Sessions"
        />
      </div>

      {/* Next Milestone Progress */}
      <div className="bg-white/50 backdrop-blur border border-zinc-200/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-zinc-700">Next Milestone</span>
          </div>
          <span className="text-sm text-zinc-500 font-medium">{currentStreak} / {nextMilestone} days</span>
        </div>
        <Progress 
          value={progressToMilestone} 
          className="h-2 bg-zinc-100"
        />
        <p className="text-xs text-zinc-500 mt-2">
          {nextMilestone - currentStreak} days until your next milestone!
        </p>
      </div>

      {/* Today's Progress */}
      <div className="bg-white/50 backdrop-blur border border-zinc-200/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-zinc-700">Today's Progress</span>
          </div>
          <span className="text-sm text-zinc-500 font-medium">{todaySessions} sessions</span>
        </div>
        <Progress 
          value={(todaySessions / 5) * 100} 
          className="h-2 bg-zinc-100"
        />
        {lastSessionDate && (
          <p className="text-xs text-zinc-500 mt-2">
            Last session {formatDistanceToNow(new Date(lastSessionDate), { addSuffix: true })}
          </p>
        )}
      </div>

      {/* Weekly Calendar */}
      <div className="bg-white/50 backdrop-blur border border-zinc-200/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-zinc-700">Weekly Overview</span>
        </div>
        <StreakCalendar lastSessionDate={lastSessionDate} />
      </div>
    </div>
  );
}