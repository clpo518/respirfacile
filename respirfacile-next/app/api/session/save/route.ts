import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getExerciseById } from "@/lib/data/exercises";

/**
 * Enregistrement d'une séance.
 *
 * Deux règles tiennent ce fichier :
 *
 * 1. `score` est réservé aux MESURES OBJECTIVES, dans l'unité de l'exercice :
 *    des pas pour le test de découverte, des secondes pour les paliers de
 *    pause. Le ressenti du patient, lui, part dans `metrics.comfort_rating`.
 *    Auparavant le client envoyait `étoiles × 20` dans `score` pour tout
 *    exercice sans saisie chiffrée : un « 100 » de satisfaction se retrouvait
 *    affiché comme un résultat clinique dans l'historique et sur la fiche
 *    praticien.
 *
 * 2. Ce qui est vérifiable est vérifié ici, pas côté client : l'exercice doit
 *    exister au catalogue, sa catégorie en est déduite, et un score n'est
 *    accepté que pour un exercice qui en attend un.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { exercise_id, duration_seconds, score, completed, comfort_rating } = body;

  if (!exercise_id) {
    return NextResponse.json({ error: "exercise_id required" }, { status: 400 });
  }

  const exercise = getExerciseById(exercise_id);
  if (!exercise) {
    return NextResponse.json({ error: "exercice inconnu" }, { status: 400 });
  }

  // Un score n'a de sens que sur un exercice qui demande une saisie.
  const objectiveScore =
    exercise.requiresInput && Number.isFinite(Number(score)) ? Math.round(Number(score)) : null;

  const rating = Number(comfort_rating);
  const metrics: Record<string, number> = {};
  if (Number.isInteger(rating) && rating >= 1 && rating <= 5) {
    metrics.comfort_rating = rating;
  }

  const seconds = Number(duration_seconds);

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      user_id: user.id,
      exercise_id,
      // La catégorie n'était jamais renseignée : les badges qui s'appuient
      // dessus (« Nez libre », « Rythme régulier ») ne pouvaient pas tomber.
      exercise_category: exercise.category,
      duration_seconds: Number.isFinite(seconds) ? Math.max(1, Math.round(seconds)) : null,
      score: objectiveScore,
      metrics: Object.keys(metrics).length > 0 ? metrics : null,
      completed: completed ?? true,
    })
    .select("id")
    .single();

  if (error) {
    console.error("session save error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
