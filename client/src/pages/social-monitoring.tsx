import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SocialMediaPost } from "@shared/schema";
import { AlertTriangle, MessageSquare, TrendingDown, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function SocialMonitoring() {
  const { user } = useAuth();

  const { data: posts } = useQuery<SocialMediaPost[]>({
    queryKey: ["/api/social-media-posts"],
  });

  const { data: urgentPosts } = useQuery<SocialMediaPost[]>({
    queryKey: ["/api/social-media-posts/urgent"],
  });

  const getSentimentColor = (score: number) => {
    if (score < -50) return "text-red-500";
    if (score < 0) return "text-orange-500";
    if (score < 50) return "text-yellow-500";
    return "text-green-500";
  };

  const getDistressIcon = (level: number) => {
    if (level >= 8) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (level >= 5) return <AlertCircle className="h-4 w-4 text-orange-500" />;
    return <MessageSquare className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      {urgentPosts?.length ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>High Distress Detected</AlertTitle>
          <AlertDescription>
            {urgentPosts.length} post{urgentPosts.length === 1 ? "" : "s"} requiring immediate attention
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Social Media Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {posts?.map((post) => (
                  <Card key={post.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getDistressIcon(post.distressLevel)}
                        <Badge variant={post.isUrgent ? "destructive" : "secondary"}>
                          {post.platform}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(post.timestamp), "MMM d, h:mm a")}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{post.content}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className={getSentimentColor(post.sentimentScore)}>
                        Sentiment: {post.sentimentScore}
                      </span>
                      <span className="text-muted-foreground">
                        Distress Level: {post.distressLevel}/10
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Urgent Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {urgentPosts?.map((post) => (
                  <Alert key={post.id} variant="destructive" className="p-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="mb-2">High Distress Content Detected</AlertTitle>
                    <AlertDescription>
                      <p className="mb-2">{post.content}</p>
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline">{post.platform}</Badge>
                        <span>{format(new Date(post.timestamp), "MMM d, h:mm a")}</span>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
