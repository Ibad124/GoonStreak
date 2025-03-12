import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { DAYS_OF_WEEK } from "@shared/schema";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function SessionHeatmap({ heatmapData }) {
  if (!heatmapData) return null;

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-[auto_repeat(24,1fr)] gap-1">
          {/* Time labels */}
          <div className="h-6" /> {/* Empty corner cell */}
          {HOURS.map(hour => (
            <div key={hour} className="text-xs text-center text-muted-foreground">
              {hour}:00
            </div>
          ))}

          {/* Heatmap grid */}
          {DAYS_OF_WEEK.map((day, dayIndex) => (
            <React.Fragment key={day}>
              <div className="text-sm py-1">{day}</div>
              {HOURS.map(hour => {
                const count = heatmapData[dayIndex]?.[hour] || 0;
                const opacity = Math.min(0.1 + (count * 0.2), 1);
                return (
                  <div
                    key={`${day}-${hour}`}
                    className="h-6 rounded"
                    style={{
                      backgroundColor: `rgba(var(--primary), ${opacity})`,
                    }}
                    title={`${count} sessions`}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

function SessionTrends({ trends }) {
  if (!trends) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Most Active Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trends.mostActiveHour}:00
            </div>
            <p className="text-xs text-muted-foreground">
              {trends.mostActiveHourSessions} sessions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Best Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {DAYS_OF_WEEK[trends.mostActiveDay]}
            </div>
            <p className="text-xs text-muted-foreground">
              {trends.mostActiveDaySessions} sessions
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SessionInsights() {
  const { data: insights, isLoading } = useQuery({
    queryKey: ["/api/insights"],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-[300px] rounded-lg bg-muted animate-pulse" />
        <div className="h-24 rounded-lg bg-muted animate-pulse" />
      </div>
    );
  }

  if (!insights || (!insights.heatmap?.length && !insights.trends)) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No session data yet. Start logging sessions to see your patterns!
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Activity Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <SessionHeatmap heatmapData={insights.heatmap} />
        </CardContent>
      </Card>

      <SessionTrends trends={insights.trends} />
    </div>
  );
}