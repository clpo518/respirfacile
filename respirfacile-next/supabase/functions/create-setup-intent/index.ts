import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.104.1";
import Stripe from "https://esm.sh/stripe@17.0.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // TODO: Set via environment variables
    // STRIPE_SECRET_KEY - Stripe API secret key
    // STRIPE_PRICE_STARTER - Price ID for Starter plan (15€/month)
    // STRIPE_PRICE_PRO - Price ID for Pro plan (30€/month)
    // STRIPE_PRICE_CABINET - Price ID for Cabinet plan (55€/month)
    // SUPABASE_URL - Supabase project URL
    // SUPABASE_SERVICE_ROLE_KEY - Service role key for admin access

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const stripePriceIds = {
      starter: Deno.env.get("STRIPE_PRICE_STARTER"),
      pro: Deno.env.get("STRIPE_PRICE_PRO"),
      cabinet: Deno.env.get("STRIPE_PRICE_CABINET"),
    };
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecretKey || !supabaseUrl || !supabaseKey) {
      throw new Error("Missing required environment variables");
    }

    const { therapist_id, plan = "starter" } = await req.json();

    if (!therapist_id) {
      throw new Error("therapist_id is required");
    }

    if (!stripePriceIds[plan as keyof typeof stripePriceIds]) {
      throw new Error(`Invalid plan: ${plan}`);
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-11-20" });
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch therapist profile to get email
    const { data: therapist, error: fetchError } = await supabase
      .from("profiles")
      .select("email, stripe_customer_id")
      .eq("id", therapist_id)
      .single();

    if (fetchError || !therapist) {
      throw new Error(`Failed to fetch therapist: ${fetchError?.message}`);
    }

    // Create or retrieve Stripe customer
    let customer_id = therapist.stripe_customer_id;

    if (!customer_id) {
      const customer = await stripe.customers.create({
        email: therapist.email,
        metadata: {
          therapist_id,
        },
      });
      customer_id = customer.id;
    }

    // Create SetupIntent for collecting payment method after trial
    const setupIntent = await stripe.setupIntents.create({
      customer: customer_id,
      payment_method_types: ["card"],
      usage: "off_session",
    });

    // Create subscription with 30-day trial and no initial charge
    // Payment method will be required when trial ends
    const subscription = await stripe.subscriptions.create({
      customer: customer_id,
      items: [
        {
          price: stripePriceIds[plan as keyof typeof stripePriceIds]!,
        },
      ],
      trial_period_days: 30,
      trial_settings: {
        end_behavior: {
          // If no payment method is saved when trial ends, cancel subscription
          missing_payment_method: "cancel",
        },
      },
      expand: ["latest_invoice.payment_intent"],
      off_session: true,
    });

    // Update profiles table with Stripe IDs and trial info
    const trial_ends_at = new Date();
    trial_ends_at.setDate(trial_ends_at.getDate() + 30);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        stripe_customer_id: customer_id,
        stripe_subscription_id: subscription.id,
        subscription_status: "trialing",
        trial_ends_at: trial_ends_at.toISOString(),
        subscription_tier: plan,
      })
      .eq("id", therapist_id);

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({
        client_secret: setupIntent.client_secret,
        customer_id,
        subscription_id: subscription.id,
        trial_ends_at: trial_ends_at.toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in create-setup-intent:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
