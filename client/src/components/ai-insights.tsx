import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Brain, Loader2, AlertTriangle } from "lucide-react";
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
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Analysis Error</AlertTitle>
        <AlertDescription className="mt-2">
          <p>Unable to generate mood analysis. Please try again later.</p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 text-xs opacity-70">
              <p>Error Details:</p>
              <pre className="mt-1 p-2 bg-black/10 rounded">
                {(error as Error).message}
              </pre>
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
          className="prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ 
            __html: data.analysis
              .replace(/\n/g, '<br>')
              .replace(/^# (.*)/gm, '<h1 class="text-xl font-bold mt-4 mb-2">$1</h1>')
              .replace(/^## (.*)/gm, '<h2 class="text-lg font-semibold mt-3 mb-2">$1</h2>')
              .replace(/^### (.*)/gm, '<h3 class="text-base font-medium mt-2 mb-1">$1</h3>')
          }} 
        />
      </CardContent>
    </Card>
  );
}