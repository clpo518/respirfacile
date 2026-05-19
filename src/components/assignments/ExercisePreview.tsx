import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronDown, ChevronRight, Eye } from "lucide-react";
import { exerciseCategories, Exercise } from "@/data/exercises";

type CategoryObject = (typeof exerciseCategories)[number];

interface ExercisePreviewProps {
  category: CategoryObject;
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
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{category.description || category.title}</p>
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
                          <p className="text-sm font-medium leading-snug">{ex.name_fr}</p>
                          <p className="text-xs text-muted-foreground/80 italic line-clamp-1 mt-0.5">
                            {ex.description_fr.slice(0, 90)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewExercise(ex);
                          }}
                          className="shrink-0 mt-0.5 p-1 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                          title="Aperçu de l'exercice"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {/* Exercise preview modal */}
      <Dialog open={!!previewExercise} onOpenChange={() => setPreviewExercise(null)}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-base">
              {previewExercise?.icon} {previewExercise?.name_fr}
            </DialogTitle>
          </DialogHeader>
          {previewExercise && (
            <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {previewExercise.description_fr}
              </p>
              <div className="rounded-lg bg-secondary/40 border border-border p-4 space-y-2">
                {previewExercise.instructions_fr.map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="font-semibold text-primary shrink-0">{i + 1}.</span>
                    <span className="text-foreground">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExercisePreview;
