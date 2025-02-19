import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Brain, Loader2 } from "lucide-react";
import { useState } from "react";

type AnalysisResponse = {
  analysis: string;
};

export default function AIInsights() {
  const { data, isLoading, error } = useQuery<AnalysisResponse>({
    queryKey: ["/api/moods/analysis"],
    // Retry failed requests 3 times
    retry: 3,
    // Only refetch on window focus if the data is older than 5 minutes
    staleTime: 5 * 60 * 1000,
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
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 text-xs opacity-70">
              Error: {(error as Error).message}
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data?.analysis) {
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
      <CardContent>
        <div 
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: data.analysis.replace(/\n/g, '<br>')
          }} 
        />
      </CardContent>
    </Card>
  );
}