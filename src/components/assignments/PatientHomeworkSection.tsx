import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getCategoryById } from "@/data/exercises";
import { BookOpen, ChevronRight, Clock, MessageSquare, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Assignment {
  id: string;
  exercise_category: string;
  exercise_id: string | null;
  message: string | null;
  created_at: string;
  status: string;
  therapist: {
    full_name: string | null;
  };
}

const PatientHomeworkSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("assignments")
        .select(`
          id,
          exercise_category,
          exercise_id,
          message,
          created_at,
          status,
          therapist:therapist_id(full_name)
        `)
        .eq("patient_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching assignments:", error);
      } else {
        // Transform the data to match our interface
        const transformed = (data || []).map((item: any) => ({
          ...item,
          therapist: item.therapist || { full_name: null },
        }));
        setAssignments(transformed);
      }
      setLoading(false);
    };

    fetchAssignments();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("assignments-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "assignments",
          filter: `patient_id=eq.${user?.id}`,
        },
        () => {
          fetchAssignments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleStartExercise = (assignment: Assignment) => {
    // Navigate to practice with the assignment context
    navigate(`/practice?category=${assignment.exercise_category}&assignment=${assignment.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  if (loading) {
    return (
      <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-accent/10">
        <CardContent className="p-6">
          <div className="animate-pulse flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-primary/20 rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (assignments.length === 0) {
    return null; // Don't show the section if no homework
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-accent/10 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-primary" />
            🎯 Mes Prescriptions
            <Badge variant="destructive" className="ml-auto">
              {assignments.length} en attente
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <AnimatePresence>
            {assignments.map((assignment, index) => {
              const category = getCategoryById(assignment.exercise_category);
              
              return (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div 
                    className="p-4 rounded-xl bg-background border-2 border-primary/20 hover:border-primary/40 transition-all cursor-pointer group"
                    onClick={() => handleStartExercise(assignment)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-2xl">
                          {category?.icon || "📖"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold">
                              {category?.title || assignment.exercise_category}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              Prescrit par {assignment.therapist?.full_name || "Votre orthophoniste"}
                            </Badge>
                          </div>
                          
                          {assignment.message && (
                            <div className="mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                              <div className="flex items-start gap-2">
                                <MessageSquare className="w-3 h-3 text-amber-600 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-amber-800 dark:text-amber-200 italic">
                                  "{assignment.message}"
                                </p>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(assignment.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button size="sm" className="gap-1 group-hover:gap-2 transition-all">
                        <BookOpen className="w-4 h-4" />
                        <span className="hidden sm:inline">Commencer</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PatientHomeworkSection;
