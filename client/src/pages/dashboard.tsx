import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MoodChart from "@/components/mood-chart";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Mood } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Brain, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [moodScore, setMoodScore] = useState<number>(5);
  const [note, setNote] = useState<string>("");

  const { data: moods } = useQuery<Mood[]>({
    queryKey: ["/api/moods"],
  });

  const moodMutation = useMutation({
    mutationFn: async (data: { score: number; note: string }) => {
      const res = await apiRequest("POST", "/api/moods", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/moods"] });
      toast({
        title: "Mood tracked successfully",
        description: "Your mood has been recorded",
      });
      setNote("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to track mood",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Track Your Mood
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>How are you feeling today?</Label>
              <Slider
                value={[moodScore]}
                onValueChange={(value) => setMoodScore(value[0])}
                min={1}
                max={10}
                step={1}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Not Great</span>
                <span>Amazing</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Add a note (optional)</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What's on your mind?"
              />
            </div>

            <Button
              onClick={() =>
                moodMutation.mutate({ score: moodScore, note })
              }
              disabled={moodMutation.isPending}
              className="w-full"
            >
              Track Mood
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Mood Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MoodChart moods={moods || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
