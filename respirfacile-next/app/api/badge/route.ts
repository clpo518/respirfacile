import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { badge_id } = body;

    if (!badge_id) {
      return NextResponse.json({ error: "badge_id requis" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("user_badges")
      .insert({ user_id: user.id, badge_id })
      .select()
      .single();

    // Code d'erreur 23505 = duplicate key (badge déjà earned)
    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({
          ok: true,
          badge: null,
          already_earned: true,
        });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      badge: data,
      already_earned: false,
    });
  } catch (error) {
    console.error("[badge] Error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
