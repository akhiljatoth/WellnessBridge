import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Home, MessageSquare, LogOut, AlertTriangle } from "lucide-react";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();

  if (!user) return null;

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/chat">
              <Button variant="ghost" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat
              </Button>
            </Link>
            <Link href="/social-monitoring">
              <Button variant="ghost" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Social Monitoring
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user.username}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}