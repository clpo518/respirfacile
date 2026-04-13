import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { ChevronUp, ChevronDown } from "lucide-react";
import {
  SlideIntro, SlideTime, SlideProgress, SlideFavorite, SlideStreak,
  SlideWords, SlideTooFast, SlideFun, SlideThanks,
  SlideTherapistIntro, SlideTherapistImpact, SlideTherapistVolume,
  SlideTherapistChampion, SlideTherapistProgress, SlideTherapistFun, SlideTherapistThanks,
} from "@/components/wrapped/slides";

interface WrappedData {
  type: "patient" | "therapist";
  year: number;
  noData?: boolean;
  [key: string]: any;
}

export default function Wrapped() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<WrappedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        // Try to get user from auth, or use query param
        let userId = searchParams.get("uid");
        if (!userId) {
          const { data: { user } } = await supabase.auth.getUser();
          userId = user?.id || null;
        }
        if (!userId) {
          setError("Connectez-vous pour voir votre bilan.");
          setLoading(false);
          return;
        }
        const year = parseInt(searchParams.get("year") || "2025");
        const { data: result, error: fnError } = await supabase.functions.invoke("generate-wrapped", {
          body: { user_id: userId, year },
        });
        if (fnError) throw fnError;
        setData(result);
      } catch (e: any) {
        setError(e.message || "Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [searchParams]);

  const slides = data ? getSlides(data) : [];
  const total = slides.length;

  const next = useCallback(() => setCurrent((c) => Math.min(c + 1, total - 1)), [total]);
  const prev = useCallback(() => setCurrent((c) => Math.max(c - 1, 0)), []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev]);

  // Touch swipe
  useEffect(() => {
    let startY = 0;
    const onStart = (e: TouchEvent) => { startY = e.touches[0].clientY; };
    const onEnd = (e: TouchEvent) => {
      const diff = startY - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); }
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [next, prev]);

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#0f172a] text-white">
        <div className="w-8 h-8 border-3 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#0f172a] text-white px-6 text-center">
        <p className="text-white/60">{error || "Aucune donnée disponible."}</p>
      </div>
    );
  }

  if (data.noData) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#0f172a] text-white px-6 text-center gap-4">
        <div className="text-5xl">🎙️</div>
        <h1 className="text-2xl font-bold">Pas encore de données</h1>
        <p className="text-white/50">Vous n'avez pas encore de sessions cette année. Commencez à vous entraîner pour voir votre bilan !</p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden bg-[#0f172a]" onClick={next}>
      <AnimatePresence mode="wait">
        <div key={current}>{slides[current]}</div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="fixed right-3 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
            className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-teal-400 scale-125" : "bg-white/20"}`}
          />
        ))}
      </div>

      {/* Nav arrows */}
      {current > 0 && (
        <button onClick={(e) => { e.stopPropagation(); prev(); }} className="fixed top-4 left-1/2 -translate-x-1/2 z-50 text-white/30 hover:text-white/60 transition">
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
      {current < total - 1 && (
        <button onClick={(e) => { e.stopPropagation(); next(); }} className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 text-white/30 hover:text-white/60 transition animate-bounce">
          <ChevronDown className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}

function getSlides(data: WrappedData): React.ReactNode[] {
  if (data.type === "therapist") {
    return [
      <SlideTherapistIntro name={data.name} year={data.year} />,
      <SlideTherapistImpact totalPatients={data.totalPatients} />,
      <SlideTherapistVolume totalSessions={data.totalSessions} totalHours={data.totalHours} />,
      ...(data.championName ? [<SlideTherapistChampion championName={data.championName} championSessions={data.championSessions} />] : []),
      <SlideTherapistProgress avgImprovement={data.avgImprovement} />,
      <SlideTherapistFun totalSyllables={data.totalSyllables} />,
      <SlideTherapistThanks year={data.year} />,
    ];
  }

  return [
    <SlideIntro name={data.name} year={data.year} />,
    <SlideTime totalHours={data.totalHours} equivalentEpisodes={data.equivalentEpisodes} />,
    <SlideProgress avgSpsFirst={data.avgSpsFirst} avgSpsLast={data.avgSpsLast} />,
    <SlideFavorite favoriteExercise={data.favoriteExercise} />,
    <SlideStreak bestStreak={data.bestStreak} activeDays={data.activeDays} />,
    <SlideWords totalWords={data.totalWords} totalSyllables={data.totalSyllables} />,
    <SlideTooFast tooFastCount={data.tooFastCount} totalSessions={data.totalSessions} />,
    <SlideFun equivalentPages={data.equivalentPages} totalHours={data.totalHours} />,
    <SlideThanks year={data.year} />,
  ];
}
