import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

interface QuotaBarProps {
  sessionsToday: number;
  maxSessions: number;
  isPremium: boolean;
}

const QuotaBar = ({ sessionsToday, maxSessions, isPremium }: QuotaBarProps) => {
  if (isPremium) return null;

  const percentage = (sessionsToday / maxSessions) * 100;
  const isLimitReached = sessionsToday >= maxSessions;

  return (
    <div className={`border-b ${isLimitReached ? 'bg-destructive/10 border-destructive/30' : 'bg-muted/50 border-border/50'}`}>
      <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <span className={`text-sm font-medium ${isLimitReached ? 'text-destructive' : 'text-muted-foreground'}`}>
            Essais gratuits aujourd'hui :
          </span>
          <div className="flex items-center gap-2 flex-1 max-w-[200px]">
            <Progress 
              value={percentage} 
              className={`h-2 ${isLimitReached ? '[&>div]:bg-destructive' : ''}`}
            />
            <span className={`text-sm font-bold ${isLimitReached ? 'text-destructive' : 'text-foreground'}`}>
              {sessionsToday}/{maxSessions}
            </span>
          </div>
          {isLimitReached && (
            <span className="text-xs text-destructive font-medium">
              Limite atteinte
            </span>
          )}
        </div>
        <Link 
          to="/pricing" 
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <Zap className="w-4 h-4" />
          Passer en illimité
        </Link>
      </div>
    </div>
  );
};

export default QuotaBar;
