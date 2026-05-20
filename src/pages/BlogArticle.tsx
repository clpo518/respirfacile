import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Wind, ArrowLeft, Clock, Calendar, ArrowRight, CheckCircle2, BookOpen, FlaskConical, ChevronRight, Play, Pause, RotateCcw, AlertCircle, Info, Sparkles, TrendingDown, Users, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────
// Types de blocs de contenu
// ─────────────────────────────────────────────

type StatItem = { value: string; label: string; source?: string; color?: string };
type ExerciseStep = { text: string; duration?: string; tip?: string };
type SymptomItem = { text: string; weight: number };

type Block =
  | { t: "p";             text: string }
  | { t: "h2";            text: string }
  | { t: "h3";            text: string }
  | { t: "ul";            items: string[] }
  | { t: "ol";            items: string[] }
  | { t: "quote";         text: string; author?: string; role?: string }
  | { t: "study";         authors: string; year: number; journal: string; finding: string; n?: string; doi?: string }
  | { t: "stats";         items: StatItem[] }
  | { t: "exercise";      name: string; icon: string; steps: ExerciseStep[]; totalDuration: string; evidence?: string }
  | { t: "symptom-check"; title: string; items: SymptomItem[]; low: string; mid: string; high: string }
  | { t: "info";          icon: string; title: string; text: string; variant?: "green" | "blue" | "amber" | "violet" | "rose" }
  | { t: "cta-patient" }
  | { t: "cta-pro" }
  | { t: "divider" }
  | { t: "key-numbers";   numbers: { value: string; label: string; sub?: string }[] };

// ─────────────────────────────────────────────
// Composants interactifs
// ─────────────────────────────────────────────

function StudyCallout({ block }: { block: Extract<Block, { t: "study" }> }) {
  return (
    <div className="my-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 flex gap-4">
      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
        <FlaskConical className="w-5 h-5 text-emerald-700" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide mb-1">
          Étude clinique · {block.authors} ({block.year}) · {block.journal}
          {block.n && <span className="ml-1 font-normal">· {block.n} participants</span>}
        </p>
        <p className="text-sm font-semibold text-emerald-900 leading-relaxed">{block.finding}</p>
      </div>
    </div>
  );
}

function StatsRow({ block }: { block: Extract<Block, { t: "stats" }> }) {
  return (
    <div className={`my-6 grid gap-4 ${block.items.length === 2 ? "grid-cols-2" : block.items.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>
      {block.items.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
          className="rounded-2xl border border-border bg-card p-4 text-center"
        >
          <p className={`font-display text-3xl font-bold ${s.color ?? "text-primary"}`}>{s.value}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-tight">{s.label}</p>
          {s.source && <p className="text-[10px] text-muted-foreground/60 mt-1 italic">{s.source}</p>}
        </motion.div>
      ))}
    </div>
  );
}

function BreathingExerciseDemo({ block }: { block: Extract<Block, { t: "exercise" }> }) {
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [tick, setTick] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentStep = block.steps[step];
  const maxTick = currentStep?.duration ? parseInt(currentStep.duration) : 5;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTick(prev => {
          if (prev + 1 >= maxTick) {
            setStep(s => {
              const next = s + 1;
              if (next >= block.steps.length) { setRunning(false); return 0; }
              return next;
            });
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, step, maxTick, block.steps.length]);

  const handleToggle = () => {
    if (running) {
      setRunning(false);
      setStep(0);
      setTick(0);
    } else {
      setStep(0);
      setTick(0);
      setRunning(true);
    }
  };

  const progress = maxTick > 0 ? (tick / maxTick) * 100 : 0;

  return (
    <div className="my-8 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-violet-100/50 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-violet-200/60">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{block.icon}</span>
          <div>
            <p className="font-semibold text-violet-900">{block.name}</p>
            <p className="text-xs text-violet-600 mt-0.5">{block.totalDuration} · {block.steps.length} étapes</p>
          </div>
          {block.evidence && (
            <span className="ml-auto text-[10px] bg-violet-200/70 text-violet-800 px-2 py-0.5 rounded-full font-medium">
              {block.evidence}
            </span>
          )}
        </div>
      </div>

      {/* Steps list */}
      <div className="px-6 py-4 space-y-3">
        {block.steps.map((s, i) => (
          <div key={i} className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-300 ${
            running && step === i ? "bg-violet-200/60 border border-violet-300" : "bg-white/50"
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
              running && step === i ? "bg-violet-600 text-white" :
              running && i < step ? "bg-green-500 text-white" :
              "bg-violet-100 text-violet-600"
            }`}>
              {running && i < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-violet-900">{s.text}</p>
              {s.duration && <p className="text-xs text-violet-600 mt-0.5">{s.duration} secondes</p>}
              {s.tip && <p className="text-xs text-violet-500 italic mt-0.5">{s.tip}</p>}
            </div>
            {running && step === i && (
              <div className="shrink-0 text-right">
                <p className="font-display text-xl font-bold text-violet-700">{maxTick - tick}s</p>
                <div className="w-12 h-1.5 bg-violet-200 rounded-full mt-1 overflow-hidden">
                  <motion.div
                    className="h-full bg-violet-600 rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.9, ease: "linear" }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="px-6 pb-5">
        <button
          onClick={handleToggle}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
            running
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : "bg-violet-600 text-white hover:bg-violet-700"
          }`}
        >
          {running ? <><Pause className="w-4 h-4" /> Arrêter</> : <><Play className="w-4 h-4 fill-white" /> Essayer cet exercice</>}
        </button>
        {!running && step > 0 && (
          <button onClick={() => { setStep(0); setTick(0); }} className="w-full mt-2 text-xs text-violet-600 flex items-center justify-center gap-1 hover:underline">
            <RotateCcw className="w-3 h-3" /> Recommencer
          </button>
        )}
      </div>
    </div>
  );
}

function SymptomChecker({ block }: { block: Extract<Block, { t: "symptom-check" }> }) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const total = block.items.reduce((acc, item, i) => checked.has(i) ? acc + item.weight : acc, 0);
  const maxScore = block.items.reduce((acc, item) => acc + item.weight, 0);
  const pct = maxScore > 0 ? (total / maxScore) * 100 : 0;
  const result = pct < 30 ? block.low : pct < 65 ? block.mid : block.high;
  const resultColor = pct < 30 ? "text-green-700 bg-green-50 border-green-200" : pct < 65 ? "text-amber-700 bg-amber-50 border-amber-200" : "text-red-700 bg-red-50 border-red-200";

  const toggle = (i: number) => setChecked(prev => {
    const next = new Set(prev);
    next.has(i) ? next.delete(i) : next.add(i);
    return next;
  });

  return (
    <div className="my-8 rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-6 pt-5 pb-4 border-b border-border/50 bg-muted/30">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <p className="font-semibold text-foreground">{block.title}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Cochez les situations qui vous correspondent</p>
      </div>
      <div className="p-5 space-y-2.5">
        {block.items.map((item, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${
              checked.has(i) ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/20 bg-background"
            }`}
          >
            <div className={`w-5 h-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all ${
              checked.has(i) ? "border-primary bg-primary" : "border-muted-foreground/30"
            }`}>
              {checked.has(i) && <CheckCircle2 className="w-3 h-3 text-white" />}
            </div>
            <p className="text-sm text-foreground leading-snug">{item.text}</p>
          </button>
        ))}
      </div>
      {checked.size > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className={`mx-5 mb-5 p-4 rounded-xl border ${resultColor}`}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-current opacity-60" />
            <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Votre profil</p>
          </div>
          <p className="text-sm font-medium leading-relaxed">{result}</p>
        </motion.div>
      )}
    </div>
  );
}

function InfoBox({ block }: { block: Extract<Block, { t: "info" }> }) {
  const colors: Record<string, string> = {
    green: "border-green-200 bg-green-50 text-green-900",
    blue: "border-blue-200 bg-blue-50 text-blue-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    violet: "border-violet-200 bg-violet-50 text-violet-900",
    rose: "border-rose-200 bg-rose-50 text-rose-900",
  };
  const cls = colors[block.variant ?? "blue"];
  return (
    <div className={`my-6 rounded-2xl border p-5 flex gap-4 ${cls}`}>
      <span className="text-2xl shrink-0 mt-0.5">{block.icon}</span>
      <div>
        <p className="font-semibold mb-1">{block.title}</p>
        <p className="text-sm opacity-80 leading-relaxed">{block.text}</p>
      </div>
    </div>
  );
}

function QuoteBlock({ block }: { block: Extract<Block, { t: "quote" }> }) {
  return (
    <blockquote className="my-6 pl-5 border-l-4 border-primary/40">
      <p className="text-lg font-medium text-foreground italic leading-relaxed">« {block.text} »</p>
      {block.author && (
        <footer className="mt-2 text-sm text-muted-foreground">
          — {block.author}{block.role && <span className="text-muted-foreground/70">, {block.role}</span>}
        </footer>
      )}
    </blockquote>
  );
}

function KeyNumbers({ block }: { block: Extract<Block, { t: "key-numbers" }> }) {
  return (
    <div className="my-8 grid grid-cols-3 gap-3">
      {block.numbers.map((n, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="text-center p-4 rounded-2xl bg-primary/5 border border-primary/15"
        >
          <p className="font-display text-3xl font-bold text-primary">{n.value}</p>
          <p className="text-xs text-foreground font-medium mt-1 leading-tight">{n.label}</p>
          {n.sub && <p className="text-[10px] text-muted-foreground mt-0.5">{n.sub}</p>}
        </motion.div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// CTA blocs
// ─────────────────────────────────────────────

function CtaPatient() {
  const navigate = useNavigate();
  return (
    <div className="my-10 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shrink-0">
          <Wind className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground text-lg">Pratiquez ces exercices guidés</p>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            RespirFacile guide chaque exercice avec une animation synchronisée. Gratuit, aucun téléchargement.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <button onClick={() => navigate("/auth?tab=signup")} className="btn-forest px-5 py-2.5 text-sm flex items-center gap-2">
              Commencer gratuitement <ArrowRight className="w-4 h-4" />
            </button>
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 underline underline-offset-4 transition-colors">
              Voir comment ça fonctionne
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function CtaPro() {
  const navigate = useNavigate();
  return (
    <div className="my-10 rounded-2xl border-2 border-primary/30 bg-card p-6">
      <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-2">Pour les orthophonistes</p>
      <p className="font-display text-xl font-semibold text-foreground leading-snug mb-4">
        Prescrivez ces exercices à vos patients. Suivez leur compliance en temps réel.
      </p>
      <ul className="space-y-2 mb-5">
        {[
          "Programmes SAOS léger / SAOS sévère / TMOF / Mixte",
          "Tableau de bord compliance : séances, score, dernière activité",
          "Accès patient via votre code PRO — sans abonnement côté patient",
        ].map(item => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => navigate("/pro")} className="btn-forest px-5 py-2.5 text-sm flex items-center gap-2">
          Essai 30 jours gratuit <ArrowRight className="w-4 h-4" />
        </button>
        <span className="text-xs text-muted-foreground">Sans CB · Jusqu'à 10 patients dès le départ</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Moteur de rendu des blocs
// ─────────────────────────────────────────────

function renderInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, j) =>
    j % 2 === 1 ? <strong key={j} className="font-semibold text-foreground">{part}</strong> : part
  );
}

function renderBlocks(blocks: Block[], insertCtaAt?: number, ctaTarget?: "patient" | "pro") {
  const elements: React.ReactNode[] = [];

  blocks.forEach((block, i) => {
    if (insertCtaAt !== undefined && i === insertCtaAt) {
      elements.push(ctaTarget === "pro" ? <CtaPro key="cta-mid" /> : <CtaPatient key="cta-mid" />);
    }

    switch (block.t) {
      case "h2":
        elements.push(<h2 key={i} className="font-display text-2xl font-bold text-foreground mt-10 mb-3 leading-snug">{block.text}</h2>);
        break;
      case "h3":
        elements.push(<h3 key={i} className="font-semibold text-lg text-foreground mt-6 mb-2">{block.text}</h3>);
        break;
      case "p":
        elements.push(<p key={i} className="text-muted-foreground leading-relaxed">{renderInline(block.text)}</p>);
        break;
      case "ul":
        elements.push(
          <ul key={i} className="space-y-2 my-1">
            {block.items.map((item, j) => (
              <li key={j} className="flex items-start gap-2.5 text-muted-foreground">
                <ChevronRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>{renderInline(item)}</span>
              </li>
            ))}
          </ul>
        );
        break;
      case "ol":
        elements.push(
          <ol key={i} className="space-y-2.5 my-1">
            {block.items.map((item, j) => (
              <li key={j} className="flex items-start gap-3 text-muted-foreground">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{j + 1}</span>
                <span className="pt-0.5">{renderInline(item)}</span>
              </li>
            ))}
          </ol>
        );
        break;
      case "quote":
        elements.push(<QuoteBlock key={i} block={block} />);
        break;
      case "study":
        elements.push(<StudyCallout key={i} block={block} />);
        break;
      case "stats":
        elements.push(<StatsRow key={i} block={block} />);
        break;
      case "key-numbers":
        elements.push(<KeyNumbers key={i} block={block} />);
        break;
      case "exercise":
        elements.push(<BreathingExerciseDemo key={i} block={block} />);
        break;
      case "symptom-check":
        elements.push(<SymptomChecker key={i} block={block} />);
        break;
      case "info":
        elements.push(<InfoBox key={i} block={block} />);
        break;
      case "cta-patient":
        elements.push(<CtaPatient key={i} />);
        break;
      case "cta-pro":
        elements.push(<CtaPro key={i} />);
        break;
      case "divider":
        elements.push(<hr key={i} className="my-8 border-border/50" />);
        break;
    }
  });

  return elements;
}

// ─────────────────────────────────────────────
// Articles
// ─────────────────────────────────────────────

type Article = {
  category: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  ctaTarget: "patient" | "pro";
  ctaInsertAt?: number;
  blocks: Block[];
  seoDescription: string;
};

const ARTICLES: Record<string, Article> = {

  // ════════════════════════════════════════════
  // ARTICLE 1 — Ronflement
  // ════════════════════════════════════════════
  "ronflement-exercices-gorge": {
    category: "Ronflement",
    title: "Ronflement : 5 exercices de gorge prouvés — et pourquoi les sprays ne suffisent pas",
    excerpt: "Votre partenaire dort dans la chambre d'à côté. Votre médecin dit que c'est normal. Ce n'est pas normal — et il existe une solution validée par 13 essais cliniques.",
    date: "20 mai 2025",
    readTime: "8 min",
    ctaTarget: "patient",
    ctaInsertAt: 12,
    seoDescription: "5 exercices cliniquement validés pour réduire le ronflement. Protocole myofonctionnel, études scientifiques et guide pratique.",
    blocks: [
      { t: "p", text: "Votre partenaire a sorti les boules Quies. Ou pire — il ne vous dit plus rien et s'est résigné. Le médecin a dit « c'est bénin ». Et vous, vous continuez de vous réveiller avec la bouche sèche et la gorge en carton." },
      { t: "p", text: "Ce que personne ne vous a dit : le ronflement n'est pas un bruit. C'est un **symptôme mécanique** — les muscles de votre gorge manquent de tonus et vibrent au passage de l'air. Et comme tout muscle, ils se renforcent." },
      { t: "symptom-check",
        title: "En combien de secondes vous reconnaissez-vous ?",
        items: [
          { text: "Vous vous réveillez avec la bouche sèche ou la gorge irritée", weight: 2 },
          { text: "Votre partenaire vous signale que vous ronflez (ou vous a changé de chambre)", weight: 3 },
          { text: "Vous avez du mal à vous endormir sur le dos", weight: 2 },
          { text: "Vous vous sentez fatigué même après 8 heures de sommeil", weight: 3 },
          { text: "Vous avez tendance à respirer par la bouche pendant la journée", weight: 2 },
          { text: "Vous vous réveillez parfois en sursaut en manquant d'air", weight: 4 },
        ],
        low: "Vos symptômes sont légers. Des exercices préventifs suffisent — commencer maintenant évite l'aggravation.",
        mid: "Profil modéré : les exercices myofonctionnels sont votre premier levier. Consultez un orthophoniste pour un bilan complet.",
        high: "Profil sévère. Il est important de consulter un médecin du sommeil pour exclure une apnée obstructive (SAOS), en parallèle des exercices.",
      },
      { t: "h2", text: "Ce qui se passe vraiment dans votre gorge quand vous ronflez" },
      { t: "p", text: "La nuit, vos muscles se relâchent — c'est normal. Mais quand les muscles de la langue, du voile du palais et des parois pharyngées **manquent de tonus de base**, ils s'affaissent trop. L'espace disponible pour l'air se rétrécit." },
      { t: "p", text: "Résultat : l'air doit passer en force dans un espace trop petit. La vitesse augmente. Les tissus mous (voile, luette, base de langue) se mettent à vibrer. Ce sont ces vibrations que votre partenaire entend." },
      { t: "info", icon: "🫁", variant: "blue", title: "La gorge n'est pas une paille fixe", text: "La lumière pharyngée est maintenue ouverte par l'activité musculaire active — même pendant le sommeil. Plus les muscles sont toniques au repos, moins ils s'affaissent. C'est précisément ce que travaillent les exercices myofonctionnels." },
      { t: "h2", text: "Pourquoi les sprays, oreillers anti-ronflement et bandelettes échouent" },
      { t: "p", text: "Les sprays de gorge hydratent les muqueuses — ils ne renforcent rien. Les bandelettes nasales ouvrent la narine — utile si vous avez une congestion, mais sans effet sur les muscles pharyngés. Les oreillers modifient la position — parfois utile à la marge, jamais curatif." },
      { t: "p", text: "Ces solutions masquent le symptôme sans traiter la cause : **le manque de tonus musculaire des voies aériennes supérieures**. Dès que vous arrêtez, le ronflement reprend." },
      { t: "study",
        authors: "Guimarães KC et al.",
        year: 2009,
        journal: "American Journal of Respiratory and Critical Care Medicine",
        finding: "3 mois d'exercices oropharyngés quotidiens (30 min/j) → IAH réduit de 39%, ronflement de 36%, somnolence diurne améliorée. Premier essai randomisé de référence sur les exercices myofonctionnels.",
        n: "31",
      },
      { t: "h2", text: "Les 5 exercices qui changent la structure musculaire de votre gorge" },
      { t: "p", text: "Ces exercices ciblent précisément les structures qui s'affaissent pendant le sommeil : la langue (génioglosse), le voile du palais (muscles vélaires), les lèvres (orbicularis oris) et les parois pharyngées latérales." },
      { t: "h3", text: "Exercice 1 — Aspiration de la langue (génioglosse)" },
      { t: "exercise",
        name: "Aspiration de la langue",
        icon: "👅",
        totalDuration: "2 min 30",
        evidence: "AirwayGym 2020 · −53% IAH",
        steps: [
          { text: "Collez TOUTE la surface de la langue contre le palais dur", duration: "5", tip: "Sentez la succion — la langue doit coller comme une ventouse" },
          { text: "Ouvrez la bouche le plus possible sans décoller la langue", duration: "5", tip: "C'est difficile — c'est normal et c'est précisément ça qui travaille le génioglosse" },
          { text: "Relâchez avec un « pop » audible", duration: "2" },
          { text: "Repos — respirez normalement par le nez", duration: "8" },
          { text: "Recommencez — objectif : 5 répétitions", duration: "5" },
        ],
      },
      { t: "h3", text: "Exercice 2 — Élévation du voile du palais (muscles vélaires)" },
      { t: "p", text: "Devant un miroir, ouvrez grand la bouche. Prononcez lentement **«Aaa»** 20 fois en observant votre luette monter à chaque voyelle. Enchaînez avec **«E-I-E-I-E»** 10 fois. 3 séries avec 20 secondes de repos. Cet exercice est central dans le protocole de Guimarães 2009." },
      { t: "h3", text: "Exercice 3 — Fermeture labiale (orbicularis oris)" },
      { t: "p", text: "Fermez les lèvres en les pressant fermement l'une contre l'autre. Maintenez 30 secondes en respirant uniquement par le nez, sans contracter les joues ni le menton. Répétez 10 fois. **Essai clinique** : l'entraînement des muscles labiaux réduit l'IAH de 12,2 à 3,9 (PMC5699856)." },
      { t: "h3", text: "Exercice 4 — Balayage du palais (mobilité linguale)" },
      { t: "p", text: "Placez la pointe de la langue contre le palais derrière les incisives. Faites-la glisser lentement vers l'arrière aussi loin que possible, puis revenez vers l'avant en frottant fermement. 15 allers-retours, 3 séries." },
      { t: "h3", text: "Exercice 5 — Gargarisme tonifiant (voile du palais en vibration)" },
      { t: "p", text: "Prenez une petite gorgée d'eau. Faites un gargarisme intense pendant 30 secondes en sentant la vibration au fond de la gorge. 3 fois de suite, idéalement le matin après le brossage. Les vibrations actives renforcent le voile du palais différemment des exercices statiques." },
      { t: "h2", text: "Le protocole des 20 minutes — validé cliniquement" },
      { t: "stats", items: [
        { value: "−50%", label: "IAH moyen après 3 mois", source: "Pisoni et al., 2024", color: "text-primary" },
        { value: "20 min", label: "par jour — durée optimale", source: "AirwayGym RCT, 2020", color: "text-violet-600" },
        { value: "90%", label: "compliance avec guidage app", source: "vs 10% sans app", color: "text-green-600" },
      ]},
      { t: "p", text: "Une séance quotidienne de 20 minutes — idéalement le soir — suffit pour observer des résultats à partir de **4 semaines**. La régularité prime sur l'intensité : 5 jours à 20 minutes valent mieux que 2 jours à 1 heure." },
      { t: "info", icon: "⏰", variant: "amber", title: "Le moment idéal : 30 minutes avant le coucher", text: "Les exercices activent les muscles pharyngés et créent un léger effet de tonus qui persiste pendant les premières heures de sommeil — celles où les apnées et ronflements sont souvent les plus intenses." },
      { t: "study",
        authors: "Camacho M, Certal V, et al.",
        year: 2015,
        journal: "SLEEP",
        finding: "Méta-analyse : la thérapie myofonctionnelle réduit l'IAH de 50% chez l'adulte et de 62% chez l'enfant. Réduction de la somnolence diurne (ESS) de 4,5 points en moyenne.",
        n: "Meta-analyse · 9 études",
      },
      { t: "divider" },
      { t: "p", text: "La bonne nouvelle : ces exercices sont bien documentés, sans effets secondaires, et complémentaires à tous les traitements existants (orthèse d'avancée mandibulaire, CPAP, chirurgie). Ils n'en remplacent aucun — mais ils en améliorent significativement l'efficacité." },
    ],
  },

  // ════════════════════════════════════════════
  // ARTICLE 2 — SAOS sans CPAP
  // ════════════════════════════════════════════
  "apnee-du-sommeil-sans-cpap-2025": {
    category: "SAOS",
    title: "Apnée du sommeil sans CPAP : ce que 13 essais randomisés confirment (et pourquoi votre orthophoniste est sous-utilisé)",
    excerpt: "Le masque CPAP change des vies. Certains ne le supportent pas. Et même ceux qui le portent pourraient aller encore plus loin avec la rééducation myofonctionnelle.",
    date: "20 mai 2025",
    readTime: "9 min",
    ctaTarget: "pro",
    ctaInsertAt: 14,
    seoDescription: "Traitement apnée du sommeil sans CPAP : la rééducation myofonctionnelle, 13 essais randomisés, protocole et résultats. Guide clinique 2025.",
    blocks: [
      { t: "p", text: "Le masque CPAP (ventilation en pression positive continue) est le traitement de référence du SAOS modéré à sévère. Il est efficace. Et selon les études, **46% des patients** l'abandonnent dans les 12 premiers mois." },
      { t: "p", text: "Ce n'est pas une question de volonté. C'est une question de tolérance physique, de claustrophobie, de bruit, de pression inconfortable. Et une question d'alternative — que personne ne leur a vraiment expliquée." },
      { t: "key-numbers",
        numbers: [
          { value: "1,5M", label: "Français sous CPAP", sub: "SECU 2024" },
          { value: "46%", label: "l'abandonnent en 12 mois", sub: "Weaver & Grunstein" },
          { value: "64%", label: "des médecins n'orientent jamais vers l'orthophoniste", sub: "DUMAS 2024" },
        ],
      },
      { t: "h2", text: "Ce que vos voies aériennes font pendant la nuit" },
      { t: "p", text: "Le SAOS est une **défaillance musculaire intermittente**. Pendant le sommeil, les muscles dilatateurs du pharynx (génioglosse, palatoglosse, muscles vélaires, constricteurs pharyngés) se relâchent. Si leur tonus de base est insuffisant, les voies aériennes supérieures s'obstruent partiellement ou totalement." },
      { t: "p", text: "L'obstruction entraîne une hypoxie (manque d'oxygène), le cerveau déclenche un micro-éveil pour relancer la respiration, et le cycle se répète. Dix fois par heure pour un SAOS léger. Plus de trente pour un SAOS sévère." },
      { t: "info", icon: "🧠", variant: "violet", title: "IAH : le chiffre qui définit tout", text: "L'Index d'Apnées-Hypopnées (IAH) mesure le nombre d'événements respiratoires par heure de sommeil. IAH < 5 : normal. 5-15 : léger. 15-30 : modéré. > 30 : sévère. La rééducation myofonctionnelle vise une réduction de l'IAH de 40 à 60%." },
      { t: "h2", text: "La rééducation myofonctionnelle : mécanismes et preuves" },
      { t: "p", text: "La thérapie myofonctionnelle orofaciale (OMT) est une rééducation structurée des muscles oropharyngés. Elle cible précisément les structures qui s'affaissent la nuit : langue, voile du palais, lèvres, muscles pharyngés latéraux." },
      { t: "p", text: "Le principe est simple : on renforce les muscles pendant la journée pour augmenter leur **tonus de base nocturne**. Comme on fait de la musculation le matin pour être plus fort toute la journée." },
      { t: "study",
        authors: "Pisoni A et al.",
        year: 2024,
        journal: "Journal of Sleep Research",
        finding: "Overview de 9 revues systématiques incluant 13 RCTs (716 patients) : l'OMT réduit l'IAH de 8,85 événements/h et l'ESS de 4,49 points en traitement seul. Effets amplifiés en combinaison avec CPAP (+CPAP : IAH −37,73 events/h).",
        n: "716",
      },
      { t: "study",
        authors: "Camacho M et al.",
        year: 2015,
        journal: "SLEEP",
        finding: "Méta-analyse fondatrice : −50% IAH adulte, −62% IAH enfant après 3 mois. Réduction somnolence diurne (ESS) significative. Référence internationale sur l'OMT.",
        n: "9 études",
      },
      { t: "h2", text: "CPAP + rééducation : la combinaison gagnante" },
      { t: "p", text: "Bonne nouvelle pour les utilisateurs de CPAP : l'OMT **améliore la compliance au masque**. Un programme d'exercices myofonctionnels pendant 3 mois réduit les pressions requises (APAP) et augmente le nombre de nuits portées (Publié dans Sleep and Breathing, 2025)." },
      { t: "p", text: "Le mécanisme : en renforçant les muscles, on réduit la résistance des voies aériennes, ce qui permet de diminuer la pression CPAP nécessaire — rendant le masque plus confortable à porter." },
      { t: "stats", items: [
        { value: "−53%", label: "IAH avec app myofonctionnelle quotidienne", source: "AirwayGym RCT, 2020", color: "text-primary" },
        { value: "+62 min", label: "de sommeil CPAP par nuit après OMT", source: "Sleep & Breathing, 2025", color: "text-amber-600" },
        { value: "48%", label: "de réduction de somnolence (ESS)", source: "AirwayGym 2020", color: "text-violet-600" },
      ]},
      { t: "h2", text: "Le protocole complet : qui, quand, comment" },
      { t: "h3", text: "Pour qui la rééducation est-elle indiquée ?" },
      { t: "ul", items: [
        "SAOS léger (IAH 5-15) : première intention, avant l'OAM ou la CPAP",
        "SAOS modéré (IAH 15-30) : en complément de la CPAP ou de l'orthèse",
        "SAOS sévère sous CPAP : pour améliorer la compliance et réduire la pression requise",
        "TMOF associés au SAOS : indication directe, rééducation multifactorielle",
        "Enfants avec respiration buccale et SAOS résiduel post-adénoïdectomie",
      ]},
      { t: "h3", text: "Durée et fréquence" },
      { t: "p", text: "La littérature converge sur **20 minutes par jour, 5 jours sur 7**. Les premiers résultats sont perceptibles à 4-6 semaines. La réduction maximale de l'IAH est atteinte autour de 3 mois. La maintenance implique 10-15 minutes par jour indéfiniment." },
      { t: "exercise",
        name: "Cohérence cardiaque pré-sommeil — 4-6",
        icon: "💓",
        totalDuration: "5 min",
        evidence: "Réduction cortisol + activation parasympathique",
        steps: [
          { text: "Inspirez doucement par le nez pendant 4 secondes", duration: "4", tip: "Ventre qui gonfle, épaules immobiles" },
          { text: "Expirez lentement par le nez pendant 6 secondes", duration: "6", tip: "L'expiration plus longue active le nerf vague" },
          { text: "Enchaînez sans pause — 5 minutes au total", duration: "4", tip: "Idéal à faire allongé dans le lit, avant de s'endormir" },
        ],
      },
      { t: "h2", text: "Le rôle de l'orthophoniste — la pièce manquante du puzzle" },
      { t: "p", text: "En France, l'orthophoniste est compétent et formé à la rééducation myofonctionnelle pour le SAOS. Un bilan oro-myo-fonctionnel est inscrit dans la nomenclature des actes orthophoniques. Pourtant, **64,6% des médecins ne les orientent jamais** vers un orthophoniste dans ce cadre (DUMAS, 2024)." },
      { t: "quote",
        text: "La prise en charge orthophonique du SAOS reste largement sous-utilisée en France, malgré un niveau de preuve croissant et des effets documentés sur l'IAH et la qualité de vie.",
        author: "DUMAS 2024",
        role: "Étude transversale sur l'orientation des patients adultes SAOS",
      },
      { t: "p", text: "L'application RespirFacile a été conçue pour combler l'espace entre les séances : les exercices prescrits par l'orthophoniste sont accessibles au patient 7j/7, guidés par animation, et leur compliance est visible en temps réel par le praticien." },
    ],
  },

  // ════════════════════════════════════════════
  // ARTICLE 3 — Langue au palais
  // ════════════════════════════════════════════
  "langue-palais-exercice-saos": {
    category: "Exercices",
    title: "Où est votre langue en ce moment ? Cet exercice de 2 minutes peut transformer votre sommeil",
    excerpt: "La position de repos de la langue est l'exercice le plus sous-estimé de la rééducation myofonctionnelle. Et le plus puissant.",
    date: "20 mai 2025",
    readTime: "7 min",
    ctaTarget: "patient",
    ctaInsertAt: 10,
    seoDescription: "Position de repos de la langue : l'exercice myofonctionnel fondamental pour l'apnée du sommeil et les troubles de la respiration nasale. Guide illustré.",
    blocks: [
      { t: "p", text: "Arrêtez-vous une seconde. Où est votre langue **maintenant** ?" },
      { t: "p", text: "Si vous devez y réfléchir — si elle est entre vos dents, appuyée contre vos dents du bas, ou quelque part au milieu de votre bouche — vous venez de découvrir quelque chose d'important sur votre respiration nocturne." },
      { t: "p", text: "La langue devrait reposer contre le **palais dur**, pointe juste derrière les incisives supérieures, surface plate collée vers le haut. Pas entre les dents. Pas en bas. Pas flottante. En haut, appuyée." },
      { t: "info", icon: "💡", variant: "amber", title: "Le test rapide : avez-vous la bonne position ?", text: "Fermez doucement la bouche. Sans forcer. Vos dents se touchent légèrement. Respirez par le nez. Maintenant : où est le bout de votre langue ? S'il n'est pas collé au palais derrière vos incisives supérieures, la position de repos de votre langue est incorrecte." },
      { t: "h2", text: "Pourquoi la position de la langue change tout — la nuit" },
      { t: "p", text: "La langue est le muscle le plus dense du corps humain par rapport à son volume. Elle est attachée à l'os hyoïde, à la mandibule, et indirectement aux structures pharyngées. Sa **position de repos** détermine la tension sur toute la chaîne musculaire des voies aériennes supérieures." },
      { t: "p", text: "Langue en bas → la mandibule s'abaisse légèrement → l'os hyoïde descend → la base de la langue se rapproche de la paroi pharyngée postérieure → l'espace aérien se rétrécit. La nuit, ce rétrécissement s'amplifie avec le relâchement musculaire global." },
      { t: "p", text: "Langue en haut, collée au palais → la tension exercée sur la mandibule et l'hyoïde maintient les voies aériennes naturellement ouvertes. **Sans effort**. Parce que c'est la position pour laquelle ces muscles ont été conçus." },
      { t: "study",
        authors: "Guimarães KC et al.",
        year: 2009,
        journal: "American Journal of Respiratory and Critical Care Medicine",
        finding: "La rééducation de la position linguale de repos fait partie du protocole d'exercices oropharyngés ayant obtenu −39% d'IAH et −36% de ronflement en 3 mois dans cet essai randomisé contrôlé.",
        n: "31",
      },
      { t: "h2", text: "L'exercice fondamental : aspiration et maintien" },
      { t: "exercise",
        name: "Position de repos de la langue",
        icon: "👅",
        totalDuration: "2 min",
        evidence: "Protocole Guimarães 2009 — Exercice fondamental OMT",
        steps: [
          { text: "Fermez doucement la bouche — dents légèrement en contact", duration: "3", tip: "Pas de pression — juste un contact naturel" },
          { text: "Placez la POINTE de la langue contre le palais dur, juste derrière les incisives supérieures", duration: "5", tip: "Cette zone s'appelle la papille incisive — c'est votre point de repère" },
          { text: "Collez maintenant TOUTE la surface de la langue contre le palais", duration: "10", tip: "Créez une légère succion — comme si vous gardiez un bonbon plat contre le palais" },
          { text: "Respirez uniquement par le nez — maintenez la position", duration: "60", tip: "Si vous oubliez et relâchez, reprenez simplement — sans frustration" },
          { text: "Relâchez, reposez 15 secondes, recommencez 3 fois", duration: "15" },
        ],
      },
      { t: "h2", text: "De 2 minutes par jour à une habitude permanente" },
      { t: "p", text: "L'objectif n'est pas de faire cet exercice 2 minutes et d'oublier. L'objectif est d'**automatiser cette position** jusqu'à ce qu'elle devienne votre repos naturel de la langue, y compris la nuit." },
      { t: "p", text: "Ça prend entre 3 et 8 semaines selon les personnes. Les patients qui progressent le plus vite sont ceux qui ajoutent des **rappels visuels** dans leur quotidien : un post-it sur l'écran de leur ordinateur, une alarme à 10h et 15h, une vérification systématique avant de prendre leur café." },
      { t: "stats", items: [
        { value: "3 sem.", label: "pour commencer à automatiser", source: "Observations cliniques", color: "text-primary" },
        { value: "8 sem.", label: "pour une habitude consolidée", source: "Protocole standard OMT", color: "text-violet-600" },
        { value: "24/7", label: "de rééducation passive une fois ancrée", color: "text-green-600" },
      ]},
      { t: "h2", text: "Les exercices complémentaires pour aller plus loin" },
      { t: "p", text: "La position de repos est le socle. Voici ce qu'on y ajoute dans un programme complet :" },
      { t: "ol", items: [
        "**Claquement de langue** (20 répétitions, 3 séries) — renforce le génioglosse par contractions dynamiques",
        "**Balayage du palais** (15 allers-retours, 3 séries) — améliore la mobilité linguale et l'indépendance langue-mâchoire",
        "**Protrusion directionnelle** (bas, gauche, droite, haut — 5 sec chaque) — tonifie la langue dans toutes les directions",
        "**Déglutition correcte** (20 fois, avant chaque repas) — rééduque le schéma de déglutition atypique qui aggrave les TMOF",
      ]},
      { t: "h2", text: "Ce que vous pouvez attendre — et en combien de temps" },
      { t: "p", text: "Les premiers effets perceptibles arrivent **à partir de 4 semaines** : moins de bouche sèche le matin, légère réduction du ronflement signalée par le partenaire, amélioration de l'énergie diurne. À 3 mois, les études mesurent en moyenne −50% d'IAH avec un programme complet." },
      { t: "info", icon: "🌿", variant: "green", title: "Pas de résultats sans régularité", text: "5 séances de 20 minutes par semaine pendant 12 semaines valent infiniment mieux que 3 séances intenses pendant 2 semaines. Le muscle se renforce à l'usage répété, pas à l'intensité ponctuelle. Comme pour la rééducation post-opératoire." },
    ],
  },

  // ════════════════════════════════════════════
  // ARTICLE 4 — Apnée du sommeil femme
  // ════════════════════════════════════════════
  "apnee-du-sommeil-femme-symptomes": {
    category: "Santé féminine",
    title: "Apnée du sommeil chez la femme : 7 signes qu'on confond encore trop souvent avec la ménopause",
    excerpt: "Le médecin a dit 'c'est le stress'. La gynéco a dit 'c'est la ménopause'. Et si c'était votre sommeil qui compromettait tout le reste ?",
    date: "20 mai 2025",
    readTime: "8 min",
    ctaTarget: "patient",
    ctaInsertAt: 11,
    seoDescription: "Apnée du sommeil chez la femme : symptômes spécifiques, diagnostic sous-estimé, lien avec la ménopause et solutions thérapeutiques. Guide 2025.",
    blocks: [
      { t: "p", text: "Vous avez 48 ans. Ou 55. Ou 62. Vous vous réveillez fatiguée malgré 8 heures de sommeil. Vous avez des maux de tête le matin. Votre concentration n'est plus ce qu'elle était. Et on vous a dit — au moins une fois — que c'était « l'âge » ou « les hormones »." },
      { t: "p", text: "Peut-être. Mais voici ce qu'on ne vous a probablement pas dit : **le risque d'apnée du sommeil chez la femme augmente de 300% après la ménopause**. Et les symptômes chez la femme ressemblent si peu aux symptômes classiques décrits (ronflement fort, somnolence évidente) que le diagnostic prend en moyenne 6,6 ans de retard." },
      { t: "stats", items: [
        { value: "×3", label: "risque SAOS post-ménopause", source: "Epidémiologie SAOS femme", color: "text-rose-600" },
        { value: "6,6 ans", label: "délai moyen de diagnostic", source: "Données épidémiologiques", color: "text-amber-600" },
        { value: "25%", label: "des femmes de 50+ concernées", color: "text-primary" },
      ]},
      { t: "h2", text: "Pourquoi les femmes sont si souvent diagnostiquées en retard" },
      { t: "p", text: "Le SAOS a longtemps été décrit comme « la maladie du gros homme qui ronfle fort ». Les études cliniques fondatrices (années 80-90) portaient majoritairement sur des hommes. Les symptômes utilisés pour décider de prescrire une polysomnographie étaient calibrés sur ce profil." },
      { t: "p", text: "Chez la femme, les apnées sont souvent **plus courtes, moins bruyantes, plus nombreuses pendant le sommeil paradoxal** (REM). Le ronflement peut être absent. La somnolence diurne peut être discrète. Mais la fragmentation du sommeil, elle, est bien réelle." },
      { t: "quote",
        text: "Les femmes présentent plus fréquemment des symptômes atypiques d'apnée du sommeil — insomnie, fatigue, céphalées matinales, troubles de l'humeur — qui orientent souvent à tort vers un diagnostic psychiatrique ou endocrinien.",
        author: "Bibliographie SAOS féminin",
        role: "Revue de littérature internationale",
      },
      { t: "h2", text: "Les 7 signes spécifiques chez la femme" },
      { t: "symptom-check",
        title: "Reconnaissez-vous votre profil ?",
        items: [
          { text: "Fatigue persistante le matin malgré un nombre d'heures de sommeil suffisant", weight: 3 },
          { text: "Maux de tête au réveil (souvent temporaux ou frontaux)", weight: 3 },
          { text: "Sensation d'avoir « mal dormi » sans raison claire", weight: 2 },
          { text: "Irritabilité, sautes d'humeur, anxiété augmentée depuis quelques mois", weight: 2 },
          { text: "Difficultés de concentration, mémoire moins performante qu'avant", weight: 2 },
          { text: "Réveils nocturnes fréquents (sans raison identifiée)", weight: 3 },
          { text: "Bouche sèche ou gorge irritée le matin", weight: 2 },
          { text: "Partenaire qui vous signale des ronflements — même légers", weight: 3 },
        ],
        low: "Profil peu évocateur — vos symptômes peuvent avoir d'autres causes. Parlez-en à votre médecin si la fatigue persiste.",
        mid: "Profil modérément évocateur d'un trouble du sommeil. Évoquez le SAOS avec votre médecin en demandant une oxymétrie nocturne ou une polysomnographie.",
        high: "Profil fortement évocateur de SAOS. Demandez explicitement à votre médecin un bilan du sommeil — en mentionnant ce checklist. Ne partez pas sans une réponse claire.",
      },
      { t: "h2", text: "Le lien hormonal : œstrogènes, progestérone et tonus musculaire" },
      { t: "p", text: "Les œstrogènes et la progestérone exercent un effet protecteur sur le tonus des muscles des voies aériennes supérieures. Avant la ménopause, ils maintiennent le génioglosse (muscle principal qui maintient la langue en avant) dans un état de tonus de base plus élevé." },
      { t: "p", text: "Après la ménopause, la chute hormonale entraîne une réduction de ce tonus musculaire. Les voies aériennes deviennent plus facilement collapsibles. **C'est précisément là qu'intervient la rééducation myofonctionnelle** : en compensant par l'entraînement musculaire ce que les hormones ne font plus." },
      { t: "info", icon: "🌸", variant: "rose", title: "Ménopause et SAOS : deux causes, une solution", text: "Les bouffées de chaleur nocturnes fragmentent le sommeil. Les apnées aussi. Les deux peuvent coexister — et se potentialiser. Un bilan complet permet de traiter les deux : traitement hormonal pour les bouffées, rééducation myofonctionnelle +/- CPAP pour les apnées." },
      { t: "h2", text: "La rééducation myofonctionnelle : pourquoi c'est particulièrement pertinent ici" },
      { t: "p", text: "Chez la femme de 50+, la rééducation myofonctionnelle présente un double avantage : elle renforce les muscles pharyngés (réduisant les apnées) **et** améliore la respiration nasale, souvent compromise par les modifications muqueuses post-ménopausiques." },
      { t: "p", text: "Contrairement à la CPAP, elle ne nécessite pas d'appareillage. Elle se pratique en 20 minutes par jour, à domicile. Et ses effets sont progressifs mais durables — à condition de la pratiquer régulièrement." },
      { t: "study",
        authors: "Saba M et al.",
        year: 2024,
        journal: "The Laryngoscope",
        finding: "7 RCTs, 310 patients : la thérapie myofonctionnelle réduit significativement l'IAH et améliore la somnolence diurne (ESS). Effets cohérents quelle que soit la sévérité initiale du SAOS.",
        n: "310",
      },
      { t: "h2", text: "Par où commencer concrètement" },
      { t: "ol", items: [
        "**Parlez-en à votre médecin** en lui demandant explicitement un bilan du sommeil — pas seulement une prise de sang thyroïdienne",
        "**Demandez une oxymétrie nocturne** (facile, remboursée, se fait à domicile avec un oxymètre)",
        "**Consultez un orthophoniste** spécialisé en rééducation myofonctionnelle (le bilan OMT est inscrit dans la nomenclature des actes)",
        "**Commencez les exercices** en autonomie pendant que vous attendez votre rendez-vous — ils ne contre-indiquent rien et peuvent déjà faire effet",
      ]},
      { t: "info", icon: "📋", variant: "blue", title: "À dire à votre médecin", text: "« Je voudrais exclure un syndrome d'apnées obstructives du sommeil. J'ai des symptômes atypiques : fatigue, céphalées matinales, réveils. Je voudrais une oxymétrie nocturne. » Cette phrase précise évite de repartir avec un simple bilan hormonal." },
    ],
  },

  // ════════════════════════════════════════════
  // ARTICLE 5 — Guide clinique orthophonistes
  // ════════════════════════════════════════════
  "orthophonie-saos-guide-clinique-2025": {
    category: "Pour les pros",
    title: "Orthophonie et SAOS en 2025 : le guide clinique que vos patients vous demandent",
    excerpt: "13 essais randomisés. 716 patients. −50% d'IAH. Et seulement 35% des orthophonistes en France se sentent formés pour prendre en charge le SAOS adulte. Ce guide est fait pour changer ça.",
    date: "20 mai 2025",
    readTime: "10 min",
    ctaTarget: "pro",
    ctaInsertAt: 16,
    seoDescription: "Guide clinique 2025 : orthophonie et SAOS adulte. Protocole de rééducation myofonctionnelle, études de référence, bilan OMT, compliance patient. Pour orthophonistes.",
    blocks: [
      { t: "p", text: "Vos patients arrivent au cabinet avec leur bilan polysomnographique et une question : « Et maintenant ? ». Le pneumologue leur a prescrit une CPAP. Certains la supportent. D'autres reviennent vous voir — parce qu'ils n'y arrivent pas, parce que le médecin leur a « conseillé de voir un orthophoniste », ou parce qu'ils ont fait leurs recherches." },
      { t: "p", text: "La bonne nouvelle : **vos compétences sont exactement ce dont ils ont besoin**. La moins bonne : les protocoles validés, les outils de compliance et les études de référence ne sont pas toujours faciles à agréger. Ce guide les consolide pour vous." },
      { t: "stats", items: [
        { value: "13", label: "essais randomisés contrôlés sur l'OMT et le SAOS", source: "Pisoni 2024", color: "text-primary" },
        { value: "−50%", label: "IAH en moyenne après 3 mois", source: "Camacho 2015", color: "text-green-600" },
        { value: "35%", label: "des orthophonistes se sentent formés SAOS adulte", source: "DUMAS 2024", color: "text-amber-600" },
      ]},
      { t: "h2", text: "La base physiologique : pourquoi l'OMT fonctionne" },
      { t: "p", text: "Le SAOS obstructif est, à sa racine, une **insuffisance du maintien actif de la lumière pharyngée** pendant le sommeil. Le génioglosse et les muscles pharyngés dilatateurs doivent maintenir les voies aériennes ouvertes contre la pression de collapsus des tissus mous environnants." },
      { t: "p", text: "Quand le tonus de base de ces muscles est insuffisant (sédentarité, vieillissement, surpoids, dysmorphie faciale, hypertrophie adénoïdo-amygdalienne résolue mais séquellaire), l'équilibre bascule vers le collapsus." },
      { t: "p", text: "La thérapie myofonctionnelle augmente le **tonus de base nocturne** par rééducation diurne. C'est exactement le même principe que la kinésithérapie respiratoire post-chirurgie thoracique : on entraîne les muscles pendant le jour pour qu'ils fonctionnent mieux la nuit." },
      { t: "study",
        authors: "Camacho M, Certal V et al.",
        year: 2015,
        journal: "SLEEP",
        finding: "Première méta-analyse de référence : IAH −50% adulte, −62% enfant. Réduction ESS −2,7 points. Augmentation SaO2 minimale. Études incluses : 3 mois de traitement, 30 min/j d'exercices quotidiens.",
        n: "9 études RCT et cohortes",
      },
      { t: "study",
        authors: "Pisoni A et al.",
        year: 2024,
        journal: "Journal of Sleep Research",
        finding: "Overview de 9 revues systématiques (21 études primaires, 13 RCTs, 716 patients). OMT standalone : IAH −8,85 events/h (IC95% −13,42 ; −4,28), ESS −4,49 points. OMT + CPAP : IAH −37,73 events/h — amélioration majeure de la compliance CPAP.",
        n: "716",
      },
      { t: "h2", text: "Les muscles cibles et les exercices correspondants" },
      { t: "p", text: "Un programme OMT complet cible 5 groupes musculaires fonctionnels :" },
      { t: "ol", items: [
        "**Génioglosse et muscles extrinsèques de la langue** → aspiration linguale (langue au palais), claquement, balayage, protrusion directionnelle",
        "**Muscles vélaires (voile du palais mou)** → élévation voile (sons Aaa/E-I), son Ah tenu, gargarisme tonifiant, phonèmes Ka-Ga-Ra",
        "**Orbicularis oris (lèvres)** → fermeture labiale résistée, tenue des lèvres, exercices de joint labial",
        "**Muscles de la déglutition** → rééducation de la déglutition atypique, position linguale pré-déglutition",
        "**Muscles respiratoires accessoires et diaphragme** → respiration nasale consciente, cohérence cardiaque, respiration diaphragmatique",
      ]},
      { t: "h2", text: "Le bilan OMT pour SAOS : que chercher" },
      { t: "info", icon: "📋", variant: "violet", title: "Points clés du bilan oro-myo-fonctionnel SAOS", text: "Position linguale de repos (correcte : langue au palais). Compétence labiale (joint labial possible). Mode respiratoire dominant (nasal/buccal). Tonus vélaire (élévation luette). Schéma de déglutition (atypique ?). Mobilité linguale. Denture et occlusion. Posture cranio-cervicale. Antécédents ORL (végétations, amygdales)." },
      { t: "h2", text: "Protocole de séance recommandé" },
      { t: "p", text: "La littérature converge sur **20-30 minutes par jour**, 5 à 7 jours par semaine. En pratique clinique, les séances avec le patient servent à valider la qualité d'exécution et à progresser dans le programme. Le travail quotidien à domicile est la vraie variable de résultat." },
      { t: "exercise",
        name: "Séance type semaine 1-4 (débutant)",
        icon: "🧑‍⚕️",
        totalDuration: "20 min",
        evidence: "Protocole adapté de Guimarães 2009 + AirwayGym 2020",
        steps: [
          { text: "Respiration nasale consciente — 3 min (ouverture de séance)", duration: "180", tip: "Vérifier : pas de respiration buccale, ventre qui bouge" },
          { text: "Position de repos de la langue — 3 × 1 min avec pause 20 sec", duration: "60", tip: "Objectif : automatisation progressive" },
          { text: "Aspiration linguale — 5 répétitions × 30 sec", duration: "30", tip: "Ouverture maximale sans décoller la langue" },
          { text: "Élévation voile (Aaa × 20, E-I-E-I-E × 10) — 3 séries", duration: "40", tip: "Miroir obligatoire — feedback visuel de la luette" },
          { text: "Gargarisme tonifiant — 3 × 30 sec", duration: "30", tip: "Son grave, fort, vibrations palatines" },
          { text: "Cohérence cardiaque 5-5 — 5 min (fermeture)", duration: "300", tip: "Idéalement le soir — effet sur l'endormissement documenté" },
        ],
      },
      { t: "h2", text: "Le défi majeur : la compliance" },
      { t: "p", text: "La littérature est unanime sur un point : sans guidage, la compliance aux exercices à domicile chute à **moins de 10% à 3 mois** (Rueda 2020). Les patients oublient, perdent le fil, se découragent de ne pas savoir s'ils font bien." },
      { t: "p", text: "Les leviers qui fonctionnent, par ordre d'efficacité :" },
      { t: "ul", items: [
        "**Biofeedback visuel en temps réel** : un guide animé synchronisé élimine le besoin de compter — compliance × 9 dans l'étude AirwayGym",
        "**Suivi de progression visible par le praticien** : l'effet « quelqu'un regarde » maintient la motivation",
        "**Rappels configurables** : notification à l'heure choisie par le patient",
        "**Programme progressif** : démarrer simple, augmenter progressivement évite l'abandon par surcharge",
      ]},
      { t: "study",
        authors: "Suzuki M et al.",
        year: 2020,
        journal: "JMIR mHealth",
        finding: "L'application AirwayGym avec biofeedback audio-visuel obtient 90% de compliance à 3 mois (vs ~10% sans application), IAH −53,4%, ESS −48%, force linguale +48%.",
        n: "15 patients",
      },
      { t: "h2", text: "Ce que RespirFacile apporte à votre pratique" },
      { t: "p", text: "RespirFacile a été conçu avec des orthophonistes pour combler exactement ce gap. Vous prescrivez un programme (SAOS léger / SAOS sévère / TMOF / Mixte). Le patient accède via votre code PRO — sans abonnement de sa part. Vous voyez en temps réel : combien de séances réalisées cette semaine, quel exercice, quel score d'auto-évaluation." },
      { t: "p", text: "Les exercices disponibles couvrent l'intégralité du protocole Guimarães + AirwayGym : aspiration linguale, élévation voile, fermeture labiale, balayage palais, déglutition correcte, cohérence cardiaque, respiration nasale, pause contrôlée." },
      { t: "info", icon: "🧑‍⚕️", variant: "green", title: "Votre tableau de bord compliance en temps réel", text: "Chaque patient lié à votre code affiche : séances cette semaine (vert ≥ 3 / orange 1-2 / rouge 0), score d'auto-évaluation post-séance (1-5 étoiles), dernière séance réalisée, nombre total de séances. Idéal pour les relances ciblées avant la consultation de suivi." },
      { t: "h2", text: "Les questions que vos patients vous poseront (et les réponses)" },
      { t: "ul", items: [
        "**« Combien de temps avant de voir un effet ? »** — 4-6 semaines pour les premiers signes (bouche moins sèche, moins de fatigue matinale). IAH mesuré à 3 mois.",
        "**« Est-ce que ça remplace ma CPAP ? »** — Non pour SAOS modéré-sévère. Oui pour certains SAOS légers. Toujours en accord avec le médecin prescripteur.",
        "**« Est-ce que mon assurance rembourse ? »** — Le bilan OMT est remboursé. Les séances de rééducation sont en cours de reconnaissance dans plusieurs caisses.",
        "**« J'ai arrêté — est-ce que tout disparaît ? »** — Les effets perdurent 6-12 mois après l'arrêt si la base musculaire a été correctement installée. La maintenance (10 min/j) suffit ensuite.",
      ]},
    ],
  },

};

// ─────────────────────────────────────────────
// Page article
// ─────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  "SAOS":            "bg-primary/10 text-primary",
  "Ronflement":      "bg-amber-100 text-amber-700",
  "Exercices":       "bg-violet-100 text-violet-700",
  "Santé féminine":  "bg-rose-100 text-rose-700",
  "Pour les pros":   "bg-blue-100 text-blue-700",
  "Bien-être":       "bg-green-100 text-green-700",
};

const BlogArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const article = slug ? ARTICLES[slug] : null;

  // Scroll to top on mount
  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <span className="text-4xl block">🌬️</span>
          <p className="text-muted-foreground">Article introuvable.</p>
          <button onClick={() => navigate("/blog")} className="btn-forest px-6 py-2">Retour au blog</button>
        </div>
      </div>
    );
  }

  const allSlugs = Object.keys(ARTICLES);
  const related = allSlugs.filter(s => s !== slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-background">

      {/* ── Header ───────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container px-4 md:px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Wind className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-semibold text-foreground text-lg">RespirFacile</span>
          </button>
          <div className="flex items-center gap-3">
            <Link to="/pro" className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors">Pour les orthophonistes</Link>
            <button onClick={() => navigate("/auth?tab=signup")} className="btn-forest text-sm px-4 py-2">Essai gratuit</button>
          </div>
        </div>
      </header>

      {/* ── Corps ──────────────────────────────── */}
      <div className="pt-32 pb-24 px-4 md:px-6">
        <div className="container mx-auto max-w-2xl">

          {/* Breadcrumb */}
          <button
            onClick={() => navigate("/blog")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au blog
          </button>

          {/* Badge */}
          <div className="mb-4">
            <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${CATEGORY_COLORS[article.category] ?? "bg-muted text-muted-foreground"}`}>
              {article.category}
            </span>
          </div>

          {/* Titre */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl md:text-4xl font-bold text-foreground mb-5 leading-tight"
          >
            {article.title}
          </motion.h1>

          {/* Excerpt */}
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">{article.excerpt}</p>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-10 pb-8 border-b border-border/50">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {article.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {article.readTime} de lecture
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              Validé cliniquement
            </span>
          </div>

          {/* Contenu */}
          <div className="space-y-5">
            {renderBlocks(article.blocks, article.ctaInsertAt, article.ctaTarget)}
          </div>

          {/* CTA final */}
          <div className="mt-12">
            {article.ctaTarget === "pro" ? <CtaPatient /> : <CtaPro />}
          </div>

          {/* Articles liés */}
          <div className="mt-16 pt-8 border-t border-border/50">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">À lire aussi</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {related.map(s => {
                const a = ARTICLES[s];
                return (
                  <Link
                    key={s}
                    to={`/blog/${s}`}
                    className="p-4 rounded-xl border border-border hover:border-primary/30 hover:shadow-sm transition-all group"
                  >
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[a.category] ?? "bg-muted text-muted-foreground"}`}>
                      {a.category}
                    </span>
                    <p className="mt-2 text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />{a.readTime}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* ── Footer ─────────────────────────── */}
      <footer className="py-8 px-4 border-t border-border/50">
        <div className="container mx-auto max-w-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2025 RespirFacile · Fait avec 🌿 en France</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link to="/legal/privacy" className="hover:text-foreground transition-colors">Confidentialité</Link>
            <Link to="/legal/terms" className="hover:text-foreground transition-colors">CGU</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogArticle;
