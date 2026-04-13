import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronDown, ChevronRight, Lightbulb, Eye } from "lucide-react";
import { ExerciseCategory, Exercise } from "@/data/exercises";

interface ExercisePreviewProps {
  category: ExerciseCategory;
}

const ExercisePreview = ({ category }: ExercisePreviewProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);

  return (
    <>
      <div className="rounded-lg border border-border bg-secondary/30 overflow-hidden">
        <div className="px-4 py-3 border-b border-border/50">
          <p className="text-sm font-semibold">
            {category.icon} {category.title} — {category.exercises.length} exercice{category.exercises.length > 1 ? "s" : ""}
          </p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{category.description}</p>
        </div>

        <div className="px-4 py-2">
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline cursor-pointer py-1">
              {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              {isOpen ? "Masquer les exercices" : "Voir les exercices"}
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-1">
              <ScrollArea className="max-h-48">
                <ul className="space-y-0.5 pb-1">
                  {category.exercises.map((ex) => (
                    <li key={ex.id} className="px-3 py-2 rounded-md group">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-snug">{ex.title}</p>
                          <p className="text-xs text-muted-foreground/80 italic line-clamp-1 mt-0.5">
                            « {ex.text.slice(0, 90)}… »
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewExercise(ex);
                          }}
                          className="shrink-0 mt-0.5 p-1 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                          title="Aperçu du texte"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {ex.tip && (
                        <p className="text-xs text-muted-foreground flex items-start gap-1.5 mt-0.5">
                          <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0 text-accent-foreground/60" />
                          <span className="line-clamp-1">{ex.tip}</span>
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {/* Exercise text preview modal */}
      <Dialog open={!!previewExercise} onOpenChange={() => setPreviewExercise(null)}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-base">
              {category.icon} {previewExercise?.title}
            </DialogTitle>
          </DialogHeader>
          {previewExercise && (
            <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
              <div className="rounded-lg bg-secondary/40 border border-border p-4">
                <p className="text-sm leading-relaxed whitespace-pre-line">
                  {previewExercise.text}
                </p>
              </div>
              {previewExercise.tip && (
                <div className="flex items-start gap-2 px-1">
                  <Lightbulb className="w-4 h-4 mt-0.5 shrink-0 text-accent-foreground/60" />
                  <p className="text-xs text-muted-foreground italic">{previewExercise.tip}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExercisePreview;
