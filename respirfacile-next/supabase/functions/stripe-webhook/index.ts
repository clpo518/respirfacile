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
    // STRIPE_WEBHOOK_SECRET - Stripe webhook signing secret
    // SUPABASE_URL - Supabase project URL
    // SUPABASE_SERVICE_ROLE_KEY - Service role key for admin access

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !supabaseKey) {
      throw new Error("Missing required environment variables");
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-11-20" });
    const supabase = createClient(supabaseUrl, supabaseKey);

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("Missing stripe-signature header");
    }

    const body = await req.text();

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    console.log(`Processing webhook event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(supabase, subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(supabase, subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(supabase, invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(supabase, invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in stripe-webhook:", error);

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

async function handleSubscriptionUpdated(
  supabase: ReturnType<typeof createClient>,
  subscription: Stripe.Subscription
) {
  const customer_id = subscription.customer as string;
  const subscription_id = subscription.id;

  // Fetch therapist by stripe_customer_id
  const { data: therapist, error: fetchError } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customer_id)
    .single();

  if (fetchError || !therapist) {
    console.error("Failed to find therapist for subscription update:", fetchError);
    return;
  }

  // Verify this is the correct subscription
  if (subscription_id !== subscription.id) {
    console.warn("Subscription ID mismatch, skipping update");
    return;
  }

  // Map Stripe status to app status
  let status = "active";
  if (subscription.status === "trialing") {
    status = "trialing";
  } else if (subscription.status === "past_due") {
    status = "past_due";
  } else if (subscription.status === "canceled") {
    status = "canceled";
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      subscription_status: status,
    })
    .eq("id", therapist.id);

  if (updateError) {
    console.error("Failed to update subscription status:", updateError);
  } else {
    console.log(`Updated subscription status to '${status}' for therapist ${therapist.id}`);
  }
}

async function handleSubscriptionDeleted(
  supabase: ReturnType<typeof createClient>,
  subscription: Stripe.Subscription
) {
  const customer_id = subscription.customer as string;

  const { data: therapist, error: fetchError } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customer_id)
    .single();

  if (fetchError || !therapist) {
    console.error("Failed to find therapist for subscription deletion:", fetchError);
    return;
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      subscription_status: "canceled",
    })
    .eq("id", therapist.id);

  if (updateError) {
    console.error("Failed to update subscription status on deletion:", updateError);
  } else {
    console.log(`Marked subscription as canceled for therapist ${therapist.id}`);
  }
}

async function handleInvoicePaymentSucceeded(
  supabase: ReturnType<typeof createClient>,
  invoice: Stripe.Invoice
) {
  const customer_id = invoice.customer as string;
  const subscription_id = invoice.subscription as string | undefined;

  if (!subscription_id) {
    console.log("Invoice payment succeeded but no subscription attached");
    return;
  }

  const { data: therapist, error: fetchError } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customer_id)
    .single();

  if (fetchError || !therapist) {
    console.error("Failed to find therapist for successful payment:", fetchError);
    return;
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      subscription_status: "active",
    })
    .eq("id", therapist.id);

  if (updateError) {
    console.error("Failed to update subscription status after payment:", updateError);
  } else {
    console.log(`Subscription activated for therapist ${therapist.id} after successful payment`);
  }
}

async function handleInvoicePaymentFailed(
  supabase: ReturnType<typeof createClient>,
  invoice: Stripe.Invoice
) {
  const customer_id = invoice.customer as string;
  const subscription_id = invoice.subscription as string | undefined;

  if (!subscription_id) {
    console.log("Invoice payment failed but no subscription attached");
    return;
  }

  const { data: therapist, error: fetchError } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customer_id)
    .single();

  if (fetchError || !therapist) {
    console.error("Failed to find therapist for failed payment:", fetchError);
    return;
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      subscription_status: "past_due",
    })
    .eq("id", therapist.id);

  if (updateError) {
    console.error("Failed to update subscription status after failed payment:", updateError);
  } else {
    console.log(`Subscription marked as past_due for therapist ${therapist.id} after payment failure`);
  }
}
