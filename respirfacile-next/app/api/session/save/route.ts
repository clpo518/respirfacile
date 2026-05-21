import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { exercise_id, duration_seconds, score, completed } = body;

  if (!exercise_id) {
    return NextResponse.json({ error: "exercise_id required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      user_id: user.id,
      exercise_id,
      duration_seconds: duration_seconds ?? null,
      score: score ?? null,
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
