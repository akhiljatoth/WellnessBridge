import { Card } from "@/components/ui/card";
import ChatInterface from "@/components/chat-interface";

export default function Chat() {
  return (
    <div className="container mx-auto p-8">
      <Card className="h-[calc(100vh-10rem)]">
        <ChatInterface />
      </Card>
    </div>
  );
}
