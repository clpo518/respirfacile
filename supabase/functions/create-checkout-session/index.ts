import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { priceType, plan } = await req.json();
    
    // B2B plans (essentiel, expert), B2C autonomous, or legacy B2C (monthly, yearly)
    const isB2BPlan = plan === "essentiel" || plan === "expert" || plan === "premium";
    const isB2CPlan = plan === "b2c";
    
    if (!isB2BPlan && !isB2CPlan && (!priceType || !["monthly", "yearly"].includes(priceType))) {
      throw new Error("Invalid price type. Must be 'monthly', 'yearly', or provide a valid plan");
    }

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("Missing or invalid authorization header");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get the user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const userId = user.id;
    const userEmail = user.email;

    if (!userEmail) {
      throw new Error("User email not found");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2023-10-16",
    });

    // Get the correct price ID based on selection
    let priceId: string | undefined;
    let seatsLimit = 3;
    let subscriptionPlan = "trial";
    let productDescription = "";
    let successUrl = "";

    if (isB2BPlan) {
      // B2B Orthophonist plans
      if (plan === "essentiel") {
        priceId = Deno.env.get("STRIPE_PRICE_ID_ESSENTIEL");
        seatsLimit = 3;
        subscriptionPlan = "starter_3";
        productDescription = "Essentiel - 3 sièges patients";
        successUrl = `${req.headers.get("origin")}/patient/list?payment=success`;
      } else if (plan === "expert") {
        priceId = Deno.env.get("STRIPE_PRICE_ID_EXPERT");
        seatsLimit = 5;
        subscriptionPlan = "pro_5";
        productDescription = "Expert - 5 sièges patients";
        successUrl = `${req.headers.get("origin")}/patient/list?payment=success`;
      } else if (plan === "premium") {
        priceId = Deno.env.get("STRIPE_PRICE_ID_PREMIUM");
        seatsLimit = 10;
        subscriptionPlan = "premium_10";
        productDescription = "Premium - 10 sièges patients";
        successUrl = `${req.headers.get("origin")}/patient/list?payment=success`;
      }
    } else if (isB2CPlan) {
      // B2C autonomous patient plan
      priceId = Deno.env.get("STRIPE_PRICE_ID_B2C");
      subscriptionPlan = "b2c";
      productDescription = "Abonnement Patient Autonome — Accès complet";
      successUrl = `${req.headers.get("origin")}/dashboard?payment=success`;
    } else {
      // Legacy B2C patient plans
      priceId = priceType === "yearly" 
        ? Deno.env.get("STRIPE_PRICE_ID_YEARLY") 
        : Deno.env.get("STRIPE_PRICE_ID_MONTHLY");
      productDescription = priceType === "yearly" 
        ? "Abonnement annuel - Accès illimité à tous les exercices"
        : "Abonnement mensuel - Accès illimité à tous les exercices";
      successUrl = `${req.headers.get("origin")}/dashboard?payment=success`;
    }

    if (!priceId) {
      throw new Error(`Price ID not configured for ${isB2BPlan ? plan : isB2CPlan ? 'b2c' : priceType}`);
    }

    console.log(`Creating checkout session for user ${userId} with ${isB2BPlan ? `B2B plan ${plan}` : isB2CPlan ? 'B2C plan' : `legacy ${priceType}`}`);

    // Check if customer already exists
    const existingCustomers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    let customerId: string;
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
      console.log(`Found existing customer: ${customerId}`);
    } else {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          supabase_user_id: userId,
        },
      });
      customerId = customer.id;
      console.log(`Created new customer: ${customerId}`);
    }

    // Build metadata
    const metadata: Record<string, string> = {
      supabase_user_id: userId,
    };
    if (isB2BPlan) {
      metadata.plan = plan;
      metadata.seats_limit = seatsLimit.toString();
      metadata.subscription_plan = subscriptionPlan;
    }
    if (isB2CPlan) {
      metadata.plan = "b2c";
      metadata.subscription_plan = "b2c";
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: successUrl,
      cancel_url: `${req.headers.get("origin")}${isB2BPlan ? "/pro/subscription" : "/pricing"}?payment=cancelled`,
      metadata,
      subscription_data: {
        metadata,
      },
    });

    console.log(`Checkout session created: ${session.id}`);

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating checkout session:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
