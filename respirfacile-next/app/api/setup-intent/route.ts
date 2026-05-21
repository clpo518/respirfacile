import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { therapist_id, plan = "starter" } = await request.json();

    if (!therapist_id) {
      return NextResponse.json(
        { error: "therapist_id is required" },
        { status: 400 }
      );
    }

    // TODO: Set via environment variables
    // NEXT_PUBLIC_SUPABASE_URL - Supabase project URL
    // SUPABASE_SERVICE_ROLE_KEY - Service role key for admin access

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase configuration");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Call the Supabase Edge Function
    const supabase = createClient(supabaseUrl, supabaseKey);

    // TODO: Update the URL to match your Supabase project's function URL
    // Format: https://<PROJECT_ID>.supabase.co/functions/v1/create-setup-intent
    const functionUrl = `${supabaseUrl}/functions/v1/create-setup-intent`;

    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        therapist_id,
        plan,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Edge Function error:", error);
      return NextResponse.json(
        { error: error.error || "Failed to create setup intent" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in setup-intent API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
