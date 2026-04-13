import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDailyExercise } from "@/hooks/useDailyExercise";

const DailyExerciseCard = () => {
  const navigate = useNavigate();
  const { category, exercise, reason, loading } = useDailyExercise();

  if (loading) {
    return (
      <Card className="mb-8">
        <CardContent className="py-6">
          <div className="animate-pulse flex items-center gap-4">
            <div className="w-12 h-12 bg-muted rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleStart = () => {
    if (category.type === "improvisation" || category.type === "proprioception") {
      navigate(`/practice?category=${category.id}`);
    } else {
      navigate(`/practice?category=${category.id}&exercise=${exercise.id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="mb-8"
    >
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-r from-primary/5 via-background to-accent/10">
        <CardContent className="py-5 px-5 md:px-6">
          <div className="flex items-center gap-1.5 text-primary mb-3">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Exercice du jour
            </span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="text-3xl flex-shrink-0 mt-0.5">{category.icon}</div>
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground truncate">
                  {exercise.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {category.title} · {reason}
                </p>
                {exercise.tip && (
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                    💡 {exercise.tip}
                  </p>
                )}
              </div>
            </div>

            <Button
              onClick={handleStart}
              size="lg"
              className="gap-2 flex-shrink-0"
            >
              <Play className="w-4 h-4" />
              <span className="hidden sm:inline">Commencer</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DailyExerciseCard;
