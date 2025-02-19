import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Message } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, AlertTriangle, Info } from "lucide-react";

export default function ChatInterface() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  const messageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/messages", {
        content,
        isBot: 0,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setMessage("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      messageMutation.mutate(message);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Crisis resources component
  const CrisisResources = () => (
    <Alert className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Need immediate help?</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-2">If you're experiencing a crisis, help is available 24/7:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Emergency: Call 911</li>
          <li>National Crisis Line: 988</li>
          <li>Crisis Text Line: Text HOME to 741741</li>
        </ul>
      </AlertDescription>
    </Alert>
  );

  return (
    <div className="flex flex-col h-full">
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          <CrisisResources />

          {messages?.map((msg, index) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${
                msg.isBot ? "justify-start" : "justify-end"
              }`}
            >
              <Card
                className={`p-3 max-w-[80%] ${
                  msg.isBot
                    ? "bg-secondary"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {msg.isBot ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    {msg.isBot ? "AI Assistant" : "You"}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                {msg.metadata && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    {msg.metadata.topics?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1">
                        {msg.metadata.topics.map((topic, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs"
                          >
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {msg.metadata.suggestedResources?.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        <div className="flex items-center gap-1 mb-1">
                          <Info className="h-3 w-3" />
                          <span>Suggested Resources:</span>
                        </div>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {msg.metadata.suggestedResources.map((resource, i) => (
                            <li key={i}>{resource}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={messageMutation.isPending}
        />
        <Button
          type="submit"
          disabled={messageMutation.isPending}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}