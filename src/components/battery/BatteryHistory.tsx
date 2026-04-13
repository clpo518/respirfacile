/**
 * Past assessments list — allows viewing completed results or resuming in-progress ones
 */
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronRight, FileText, Play } from "lucide-react";

export interface AssessmentRecord {
  id: string;
  created_at: string;
  completed_at: string | null;
  status: string;
  results: any;
  guest_name: string | null;
  patient_id: string | null;
  patient_full_name?: string | null;
}

interface Props {
  patientId?: string;
  therapistId: string;
  onViewResults?: (assessment: AssessmentRecord) => void;
  onResume?: (assessment: AssessmentRecord) => void;
}

const BatteryHistory: React.FC<Props> = ({ patientId, therapistId, onViewResults, onResume }) => {
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      let query = supabase
        .from('assessments')
        .select('id, created_at, completed_at, status, results, guest_name, patient_id')
        .eq('therapist_id', therapistId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      const { data } = await query;
      const records = (data as AssessmentRecord[]) || [];

      // Resolve patient names from profiles for linked patients
      const patientIds = [...new Set(records.filter(r => r.patient_id && !r.guest_name).map(r => r.patient_id!))];
      let nameMap: Record<string, string> = {};
      if (patientIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', patientIds);
        if (profiles) {
          nameMap = Object.fromEntries(profiles.map(p => [p.id, p.full_name || '']));
        }
      }

      setAssessments(records.map(r => ({
        ...r,
        patient_full_name: r.guest_name || (r.patient_id ? nameMap[r.patient_id] : null),
      })));
      setLoading(false);
    };
    load();
  }, [patientId, therapistId]);

  if (loading) {
    return <div className="text-sm text-muted-foreground text-center py-4">Chargement…</div>;
  }

  if (assessments.length === 0) {
    return null;
  }

  const inProgress = assessments.filter(a => a.status === 'in_progress');
  const completed = assessments.filter(a => a.status === 'completed');

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Bilans précédents ({assessments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* In-progress assessments — resumable */}
        {inProgress.map(a => (
          <button
            key={a.id}
            onClick={() => onResume?.(a)}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors text-left"
          >
            <Play className="w-4 h-4 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">
                {a.patient_full_name || a.guest_name || 'Patient inconnu'} — {new Date(a.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </div>
              <div className="text-xs text-muted-foreground">
                Bilan en cours — cliquez pour reprendre
              </div>
            </div>
            <Badge variant="outline" className="shrink-0 border-primary/50 text-primary">
              Reprendre
            </Badge>
          </button>
        ))}

        {/* Completed assessments */}
        {completed.map(a => (
          <button
            key={a.id}
            onClick={() => onViewResults?.(a)}
            className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left"
          >
            <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">
                {a.patient_full_name || a.guest_name || 'Patient inconnu'} — {new Date(a.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </div>
              <div className="text-xs text-muted-foreground">
                Terminé le {new Date(a.completed_at!).toLocaleDateString('fr-FR')}
              </div>
            </div>
            <Badge variant="secondary" className="shrink-0">
              Terminé
            </Badge>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </button>
        ))}
      </CardContent>
    </Card>
  );
};

export default BatteryHistory;
