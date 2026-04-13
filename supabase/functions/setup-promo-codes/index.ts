import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("Missing authorization");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    const adminIds = (Deno.env.get("ADMIN_USER_IDS") ?? "").split(",").map(s => s.trim());
    if (!adminIds.includes(user.id)) throw new Error("Admin only");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2023-10-16",
    });

    const results: Record<string, string> = {};

    // 1. Create coupon: 20% off for 3 months
    const coupon = await stripe.coupons.create({
      percent_off: 20,
      duration: "repeating",
      duration_in_months: 3,
      name: "Promo lancement 20% - 3 mois",
    });
    results.coupon_id = coupon.id;

    // 2. Create promo code "clesdecom" for B2B ortho plans
    const promoB2B = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code: "clesdecom",
      metadata: { target: "b2b", description: "Clés de Com - 20% ortho 3 mois" },
    });
    results.promo_clesdecom = promoB2B.code;

    // 3. Create promo code "Amy" for B2C plans
    const promoB2C = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code: "Amy",
      metadata: { target: "b2c", description: "Amy - 20% particuliers 3 mois" },
    });
    results.promo_amy = promoB2C.code;

    console.log("Promo codes created:", results);

    return new Response(JSON.stringify({ success: true, ...results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
