import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Brain, Loader2 } from "lucide-react";

export default function AIInsights() {
  const { data: analysisData, isLoading, error } = useQuery({
    queryKey: ["/api/moods/analysis"],
    // Only fetch analysis if there's mood data
    enabled: true,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load AI analysis. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!analysisData) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Mental Health Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="prose prose-sm max-w-none">
        <div className="whitespace-pre-wrap">{analysisData.analysis}</div>
      </CardContent>
    </Card>
  );
}
