import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { type Mood } from "@shared/schema";

export default function MoodChart({ moods }: { moods: Mood[] }) {
  const data = moods.map((mood) => ({
    timestamp: new Date(mood.timestamp).toLocaleDateString(),
    score: mood.score,
  }));

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis
            dataKey="timestamp"
            stroke="#888888"
            fontSize={12}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            domain={[1, 10]}
            ticks={[1, 3, 5, 7, 10]}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <Card className="p-2">
                    <p className="text-sm font-medium">
                      Score: {payload[0].value}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {payload[0].payload.timestamp}
                    </p>
                  </Card>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            strokeWidth={2}
            stroke="hsl(var(--primary))"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
