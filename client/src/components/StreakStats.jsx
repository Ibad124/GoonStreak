import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, Trophy, Zap, Calendar, Clock, Circle, Flame, Target, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow, format, startOfWeek, eachDayOfInterval, isToday } from "date-fns";

function StatCard({ icon, value, label, highlight }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className={`p-4 flex flex-col items-center bg-white/50 backdrop-blur border-zinc-200/50 hover:shadow-lg hover:shadow-blue-900/5 transition-all ${highlight ? 'border-blue-500/50' : ''}`}>
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-2 relative"
        >
          {icon}
          {highlight && (
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          )}
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

function StreakFlame({ streak }) {
  const size = Math.min(1 + (streak * 0.1), 2);
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: size }}
      className="text-orange-500"
    >
      <Flame className="h-6 w-6" />
    </motion.div>
  );
}

function AchievementBadge({ type, earned }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`rounded-full p-2 ${earned ? 'bg-blue-500 text-white' : 'bg-zinc-100 text-zinc-400'}`}
    >
      <Award className="h-4 w-4" />
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
            <motion.div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs relative
                ${isActive ? 'bg-blue-500 text-white' : 
                  isToday(day) ? 'border-2 border-blue-500/50' : 'bg-zinc-100'}
              `}
              whileHover={{ scale: 1.1 }}
            >
              {format(day, 'd')}
              {isActive && (
                <motion.div
                  className="absolute -bottom-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <StreakFlame streak={1} />
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

function getMotivationalMessage(streak) {
  if (streak === 0) return "Start your streak today!";
  if (streak < 3) return "You're building momentum!";
  if (streak < 7) return "You're on fire! Keep it up!";
  if (streak < 14) return "Incredible dedication!";
  return "You're unstoppable! 🔥";
}

export default function StreakStats({ stats }) {
  if (!stats || !stats.user) {
    return null;
  }

  const { 
    currentStreak = 0, 
    longestStreak = 0, 
    totalSessions = 0, 
    todaySessions = 0, 
    lastSessionDate = null 
  } = stats.user;

  // Calculate next milestone and multiplier
  const nextMilestone = Math.ceil(currentStreak / 5) * 5;
  const progressToMilestone = (currentStreak / nextMilestone) * 100;
  const streakMultiplier = Math.floor(currentStreak / 5) + 1;

  const motivationalMessage = getMotivationalMessage(currentStreak);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={<Zap className="h-8 w-8 text-amber-500/90" />}
          value={currentStreak}
          label="Current Streak"
          highlight={currentStreak > 0}
        />
        <StatCard
          icon={<Trophy className="h-8 w-8 text-blue-500/90" />}
          value={longestStreak}
          label="Best Streak"
          highlight={currentStreak === longestStreak}
        />
        <StatCard
          icon={<Star className="h-8 w-8 text-purple-500/90" />}
          value={totalSessions}
          label="Total Sessions"
        />
      </div>

      {/* Streak Multiplier */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur border border-amber-200/50 rounded-lg p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="font-medium text-orange-700">Streak Multiplier</span>
          </div>
          <div className="text-2xl font-bold text-orange-500">x{streakMultiplier}</div>
        </div>
        <p className="text-sm text-orange-700/70 mt-1">
          Earn {streakMultiplier}x XP for completing sessions!
        </p>
      </motion.div>

      {/* Motivational Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-2"
      >
        <p className="text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {motivationalMessage}
        </p>
      </motion.div>

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

      {/* Achievement Badges */}
      <div className="bg-white/50 backdrop-blur border border-zinc-200/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-zinc-700">Achievements</span>
        </div>
        <div className="flex gap-2 justify-center">
          <AchievementBadge type="streak3" earned={currentStreak >= 3} />
          <AchievementBadge type="streak7" earned={currentStreak >= 7} />
          <AchievementBadge type="streak14" earned={currentStreak >= 14} />
          <AchievementBadge type="streak30" earned={currentStreak >= 30} />
          <AchievementBadge type="streak100" earned={currentStreak >= 100} />
        </div>
      </div>
    </div>
  );
}