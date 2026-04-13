import { useEffect, useState, useMemo } from "react"; // v2
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ArrowLeft, BookOpen, Sparkles, Send, MessageCircle, FlaskConical, ClipboardPaste, Timer, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { exerciseCategories, ExerciseCategory } from "@/data/exercises";
import AssignExerciseModal from "@/components/assignments/AssignExerciseModal";
import DailyExerciseCard from "@/components/dashboard/DailyExerciseCard";
import CustomTextModal from "@/components/library/CustomTextModal";

type FilterTab = "all" | "reading" | "oral" | "motor" | "special" | "neurologie";

const FILTER_TABS: { id: FilterTab; label: string; emoji: string }[] = [
  { id: "all", label: "Tous", emoji: "📚" },
  { id: "reading", label: "Lecture", emoji: "📖" },
  { id: "oral", label: "Oral libre", emoji: "🎤" },
  { id: "motor", label: "Moteur", emoji: "⚡" },
  { id: "special", label: "Spécial", emoji: "✨" },
  { id: "neurologie", label: "Neurologie", emoji: "🧠" },
];

const getFilterGroup = (cat: ExerciseCategory): FilterTab => {
  if (cat.type === "improvisation") return "oral";
  if (cat.type === "warmup" || cat.type === "repetition") return "motor";
  if (cat.type === "proprioception" || cat.type === "rebus") return "special";
  if (cat.type === "retelling") return "reading";
  if (cat.type === "neurologie") return "neurologie";
  return "reading";
};

const Library = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const forPatientId = searchParams.get("for_patient");
  const [isTherapist, setIsTherapist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; title: string } | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [customTextOpen, setCustomTextOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("profiles")
        .select("is_therapist")
        .eq("id", user.id)
        .maybeSingle();
      setIsTherapist(data?.is_therapist || false);
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const filteredCategories = useMemo(() => {
    if (activeFilter === "all") return exerciseCategories;
    return exerciseCategories.filter(cat => getFilterGroup(cat) === activeFilter);
  }, [activeFilter]);

  const handleCategoryClick = (categoryId: string) => {
    const patientParam = forPatientId ? `&for_patient=${forPatientId}` : "";
    // Neuro categories go to dedicated NeurologyTraining page
    if (categoryId.startsWith("neuro-")) {
      navigate(`/neuro-training?category=${categoryId}${patientParam}`);
      return;
    }
    navigate(`/practice?category=${categoryId}${patientParam}`);
  };

  const handleAssignClick = (e: React.MouseEvent, categoryId: string, categoryTitle: string) => {
    e.stopPropagation();
    setSelectedCategory({ id: categoryId, title: categoryTitle });
    setAssignModalOpen(true);
  };

  // Patient-useful tags: what does this exercise work on?
  const getUsefulTags = (cat: ExerciseCategory): { text: string; class: string }[] => {
    const tags: { text: string; class: string }[] = [];
    const green = "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400";
    const blue = "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
    const amber = "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400";
    const pink = "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400";
    const teal = "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400";
    const violet = "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400";
    const indigo = "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400";

    switch (cat.id) {
      case "slow-reading": tags.push({ text: "Débit", class: green }); break;
      case "articulation": tags.push({ text: "Débit", class: green }, { text: "Articulation", class: blue }); break;
      case "pauses": tags.push({ text: "Pauses", class: amber }); break;
      case "complex-reading": tags.push({ text: "Débit", class: green }, { text: "Avancé", class: violet }); break;
      case "improvisation": tags.push({ text: "Oral spontané", class: pink }); break;
      case "clinical-texts": tags.push({ text: "Bilan", class: violet }); break;
      case "breath": tags.push({ text: "Respiration", class: amber }); break;
      case "sciences": tags.push({ text: "Débit", class: green }, { text: "Technique", class: blue }); break;
      case "diadochokinesis": tags.push({ text: "Coordination", class: indigo }); break;
      case "rebus-kids": tags.push({ text: "Enfant", class: amber }); break;
      case "retelling": tags.push({ text: "Mémoire", class: blue }, { text: "Narration", class: green }); break;
      case "neuro-projection": tags.push({ text: "Volume", class: teal }, { text: "Parkinson", class: violet }); break;
      case "neuro-articulation": tags.push({ text: "Articulation", class: teal }, { text: "Dysarthrie", class: violet }); break;
      case "neuro-coherence": tags.push({ text: "Mémoire", class: teal }, { text: "Cognitif", class: violet }); break;
      case "latence": tags.push({ text: "Précipitation", class: violet }, { text: "Pauses", class: amber }); break;
      default:
        // Fallback based on type
        if (cat.type === "warmup") tags.push({ text: "Échauffement", class: amber });
        else if (cat.type === "repetition") tags.push({ text: "Coordination", class: indigo });
        else tags.push({ text: "Lecture", class: blue });
    }
    return tags;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent/30">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={forPatientId ? `/patient/${forPatientId}` : "/dashboard"} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>{forPatientId ? "Patient" : "Retour"}</span>
          </Link>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-display font-bold">Bibliothèque</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      {/* Therapist patient mode banner */}
      {forPatientId && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-3 text-center text-sm text-primary">
          <p className="font-medium">📋 Mode séance — exercice pour votre patient</p>
          <p className="text-xs mt-1 opacity-80">Choisissez un exercice ci-dessous. L'audio et les mesures seront enregistrés dans son dossier.</p>
        </div>
      )}

      <main className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Therapist Discovery Banner */}
          {isTherapist && !forPatientId && (
            <div className="flex items-start gap-3 p-3 mb-6 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-sm">
              <FlaskConical className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-blue-700 dark:text-blue-300">Mode Découverte</p>
                <p className="text-blue-600/80 dark:text-blue-400/80 text-xs mt-0.5">
                  Vous explorez en tant qu'orthophoniste. Pour enregistrer dans le dossier d'un patient, utilisez le bouton « S'exercer » depuis sa fiche.
                </p>
              </div>
            </div>
          )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Hero */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Choisissez votre exercice</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
              Vos exercices
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm">
              {exerciseCategories.length} catégories · {exerciseCategories.reduce((sum, c) => sum + c.exercises.length, 0)} exercices à votre rythme
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide justify-center flex-wrap">
            {FILTER_TABS.map(tab => {
              let count = tab.id === "all" 
                ? exerciseCategories.length 
                : exerciseCategories.filter(c => getFilterGroup(c) === tab.id).length;
              // Include Dialogue mode in oral count, Silence Training in special count
              if (tab.id === "oral" || tab.id === "all") count += 1;
              if (tab.id === "special" || tab.id === "all") count += 1;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    activeFilter === tab.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span>{tab.emoji}</span>
                  <span>{tab.label}</span>
                  <span className={`text-xs ml-0.5 ${activeFilter === tab.id ? "text-primary-foreground/70" : "text-muted-foreground/60"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>


          {/* Custom Text Card */}
          {(activeFilter === "all" || activeFilter === "reading") && (
            <motion.div
              className="mb-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              <Card
                className="relative cursor-pointer transition-all overflow-hidden bg-card border-2 border-dashed border-border hover:shadow-lg hover:border-primary/30 group"
                onClick={() => setCustomTextOpen(true)}
              >
                <div className="flex items-center gap-4 p-4 sm:p-5">
                  <div className="text-3xl sm:text-4xl shrink-0">📝</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <CardTitle className="text-base sm:text-lg leading-tight">Mon texte</CardTitle>
                      <span className="inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                        Nouveau
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      Collez votre propre texte (exposé, article, texte clinique…) et entraînez-vous avec le biofeedback.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-muted-foreground group-hover:text-primary transition-colors shrink-0"
                    onClick={(e) => { e.stopPropagation(); setCustomTextOpen(true); }}
                  >
                    <Activity className="w-4 h-4" />
                    <span className="hidden sm:inline">Coller</span>
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
          {/* Silence Training - Featured Card */}
          {(activeFilter === "all" || activeFilter === "special") && (
            <motion.div
              className="mb-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
            >
              <Card
                className="relative cursor-pointer transition-all overflow-hidden bg-card border-border hover:shadow-lg hover:border-primary/30 group"
                onClick={() => navigate("/silence-training")}
              >
                <div className="flex items-center gap-4 p-4 sm:p-5">
                  <div className="text-3xl sm:text-4xl shrink-0">🧘</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <CardTitle className="text-base sm:text-lg leading-tight">Tolérance au Silence</CardTitle>
                      <span className="inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                        Nouveau
                      </span>
                      <span className="inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
                        Désensibilisation
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      Faux dialogue avec pauses imposées. Apprenez à accepter les silences qui vous semblent trop longs.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isTherapist && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-primary border-primary/30 hover:bg-primary/10 hidden sm:flex"
                        onClick={(e) => handleAssignClick(e, "silence-training", "Tolérance au Silence")}
                      >
                        <Send className="w-3.5 h-3.5" />
                        Prescrire
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-muted-foreground group-hover:text-primary transition-colors"
                      onClick={(e) => { e.stopPropagation(); navigate("/silence-training"); }}
                    >
                      <Activity className="w-4 h-4" />
                      <span className="hidden sm:inline">Commencer</span>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Dialogue Mode - Featured Card */}
          {(activeFilter === "all" || activeFilter === "oral") && (
            <motion.div
              className="mb-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card
                className="relative cursor-pointer transition-all overflow-hidden bg-card border-border hover:shadow-lg hover:border-primary/30 group"
                onClick={() => navigate("/dialogue")}
              >
                <div className="flex items-center gap-4 p-4 sm:p-5">
                  <div className="text-3xl sm:text-4xl shrink-0">💬</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <CardTitle className="text-base sm:text-lg leading-tight">Mode Dialogue</CardTitle>
                      <span className="inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        ⭐ Recommandé
                      </span>
                      <span className="inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400">
                        Oral libre
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      Parlez librement avec un retour visuel en temps réel. L'exercice clé pour appliquer vos acquis au quotidien.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isTherapist && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-primary border-primary/30 hover:bg-primary/10 hidden sm:flex"
                        onClick={(e) => handleAssignClick(e, "dialogue", "Mode Dialogue")}
                      >
                        <Send className="w-3.5 h-3.5" />
                        Prescrire
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-muted-foreground group-hover:text-primary transition-colors"
                      onClick={(e) => { e.stopPropagation(); navigate("/dialogue"); }}
                    >
                      <Activity className="w-4 h-4" />
                      <span className="hidden sm:inline">Commencer</span>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Category Cards */}
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {filteredCategories.map((category, index) => {
                const tags = getUsefulTags(category);
                return (
                  <motion.div
                    key={category.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.04, duration: 0.3 }}
                  >
                    <Card
                      className="relative cursor-pointer transition-all overflow-hidden bg-card border-border hover:shadow-lg hover:border-primary/30 group"
                      onClick={() => handleCategoryClick(category.id)}
                    >
                      <div className="flex items-center gap-4 p-4 sm:p-5">
                        {/* Icon */}
                        <div className="text-3xl sm:text-4xl shrink-0">{category.icon}</div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <CardTitle className="text-base sm:text-lg leading-tight">{category.title}</CardTitle>
                            {tags.map((tag, i) => (
                              <span key={i} className={`inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full ${tag.class}`}>
                                {tag.text}
                              </span>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1 sm:line-clamp-2">
                            {category.description}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            {category.exercises.length} exercices
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {isTherapist && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-primary border-primary/30 hover:bg-primary/10 hidden sm:flex"
                              onClick={(e) => handleAssignClick(e, category.id, category.title)}
                            >
                              <Send className="w-3.5 h-3.5" />
                              Prescrire
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-muted-foreground group-hover:text-primary transition-colors"
                          >
                            <Activity className="w-4 h-4" />
                            <span className="hidden sm:inline">Commencer</span>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

        </motion.div>
      </main>

      {/* Assign Exercise Modal (Therapists only) */}
      {selectedCategory && (
        <AssignExerciseModal
          isOpen={assignModalOpen}
          onClose={() => {
            setAssignModalOpen(false);
            setSelectedCategory(null);
          }}
          exerciseCategory={selectedCategory.id}
          exerciseTitle={selectedCategory.title}
        />
      )}
      {/* Custom Text Modal */}
      <CustomTextModal open={customTextOpen} onOpenChange={setCustomTextOpen} />
    </div>
  );
};

export default Library;
