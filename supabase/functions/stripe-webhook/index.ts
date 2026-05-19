import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function to send emails via the send-email edge function
async function sendEmail(
  type: string,
  to: string,
  data: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
        },
        body: JSON.stringify({ type, to, data }),
      }
    );
    const result = await response.json();
    if (!response.ok) {
      console.error(`Failed to send ${type} email to ${to}:`, result);
      return { success: false, error: result.error };
    }
    console.log(`Successfully sent ${type} email to ${to}`);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Error sending ${type} email:`, errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Notify admin (Clément) when a payment succeeds
async function notifyAdminNewPayment(
  userName: string,
  userEmail: string,
  planName: string,
  isTherapist: boolean
) {
  try {
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      console.warn("RESEND_API_KEY not set, skipping admin notification");
      return;
    }
    const role = isTherapist ? "Orthophoniste" : "Patient";
    const subject = `💰 Nouveau paiement – ${userName} (${role})`;
    const html = `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;">
        <h2 style="color:#3a9e8e;">Nouveau paiement reçu 🎉</h2>
        <p><strong>Utilisateur :</strong> ${userName}</p>
        <p><strong>Email :</strong> ${userEmail}</p>
        <p><strong>Rôle :</strong> ${role}</p>
        <p><strong>Plan :</strong> ${planName}</p>
        <p style="color:#6e7282;font-size:13px;margin-top:24px;">— RespirFacile (notification automatique)</p>
      </div>
    `;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "RespirFacile <noreply@respirfacile.fr>",
        to: ["clement@escape-kit.com"],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("Admin notification failed:", err);
    } else {
      console.log("Admin payment notification sent");
    }
  } catch (e) {
    console.error("Error sending admin notification:", e);
  }
}

// Helper to get user email from Stripe customer or auth
// deno-lint-ignore no-explicit-any
async function getUserEmail(
  stripe: Stripe,
  supabaseAdmin: any,
  customerId: string,
  userId?: string
): Promise<{ email: string | null; userName: string | null }> {
  // Try to get from auth if we have userId
  if (userId) {
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (authUser?.user?.email) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .single();
      const userName: string = (profile?.full_name as string) || authUser.user.email.split("@")[0];
      return { 
        email: authUser.user.email, 
        userName
      };
    }
  }

  // Fallback: get from Stripe customer
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer && !customer.deleted && "email" in customer && customer.email) {
      const userName: string = customer.name || customer.email.split("@")[0];
      return { email: customer.email, userName };
    }
  } catch (err) {
    console.error("Error retrieving Stripe customer:", err);
  }

  return { email: null, userName: null };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
    apiVersion: "2023-10-16",
  });

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      console.error("No stripe-signature header");
      return new Response("No signature", { status: 400 });
    }

    const body = await req.text();
    
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error(`Webhook signature verification failed: ${errorMessage}`);
      return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
    }

    console.log(`Received Stripe event: ${event.type}`);

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        
        if (!userId) {
          console.error("No supabase_user_id in session metadata");
          break;
        }

        console.log(`Checkout completed for user ${userId}`);

        // Check if this is a B2B plan (orthophonist)
        const isB2BPlan = session.metadata?.plan === "essentiel" || session.metadata?.plan === "expert" || session.metadata?.plan === "premium";
        const seatsLimit = session.metadata?.seats_limit ? parseInt(session.metadata.seats_limit) : null;
        const subscriptionPlan = session.metadata?.subscription_plan || null;

        // Build update payload
        const updatePayload: Record<string, unknown> = {
          is_premium: true,
          stripe_customer_id: session.customer as string,
          subscription_status: "active",
          updated_at: new Date().toISOString(),
        };

        // Add B2B specific fields
        if (isB2BPlan && seatsLimit) {
          updatePayload.seats_limit = seatsLimit;
          updatePayload.subscription_plan = subscriptionPlan;
          console.log(`B2B plan: ${subscriptionPlan}, seats: ${seatsLimit}`);
        }

        // Update user profile
        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update(updatePayload)
          .eq("id", userId);

        if (updateError) {
          console.error("Error updating profile:", updateError);
        } else {
          console.log(`User ${userId} upgraded - ${isB2BPlan ? `B2B plan ${subscriptionPlan}` : "premium"}`);
          
          // Send subscription confirmed email
          const { email: userEmail, userName } = await getUserEmail(
            stripe,
            supabaseAdmin,
            session.customer as string,
            userId
          );
          if (userEmail) {
            const planLabel = isB2BPlan 
              ? (subscriptionPlan === "premium_10" ? "Premium (10 patients)" : subscriptionPlan === "pro_5" ? "Expert (5 patients)" : "Essentiel (3 patients)")
              : "Premium";

            // Retrieve the latest invoice URL for the customer
            let invoiceUrl: string | undefined;
            try {
              if (session.invoice) {
                const invoice = await stripe.invoices.retrieve(session.invoice as string);
                invoiceUrl = invoice.hosted_invoice_url ?? undefined;
              }
            } catch (err) {
              console.error("Error retrieving invoice URL:", err);
            }

            await sendEmail("subscription_confirmed", userEmail, {
              userName: userName || "Utilisateur",
              planName: planLabel,
              isTherapist: isB2BPlan,
              invoiceUrl,
              dashboardUrl: isB2BPlan
                ? "https://www.respirfacile.fr/patients"
                : "https://www.respirfacile.fr/practice",
            });
            // Notify admin
            await notifyAdminNewPayment(
              userName || "Utilisateur",
              userEmail,
              planLabel,
              isB2BPlan
            );
          }
        }

        // ===== REFERRAL BONUS LOGIC =====
        // Check if this user was referred by someone
        const { data: referral } = await supabaseAdmin
          .from("referrals")
          .select("id, referrer_id, status, referrer_rewarded, referred_rewarded")
          .eq("referred_id", userId)
          .eq("status", "pending")
          .maybeSingle();

        if (referral) {
          console.log(`Found pending referral for user ${userId}, referrer: ${referral.referrer_id}`);
          
          // 1. Increment internal bonus counters
          await supabaseAdmin.rpc("increment_referral_bonus", { user_id: referral.referrer_id });
          await supabaseAdmin.rpc("increment_referral_bonus", { user_id: userId });

          // 2. Apply Stripe coupon to the REFERRER's active subscription (1 month free)
          try {
            const { data: referrerProfile } = await supabaseAdmin
              .from("profiles")
              .select("stripe_customer_id, full_name")
              .eq("id", referral.referrer_id)
              .maybeSingle();

            if (referrerProfile?.stripe_customer_id) {
              // Create a one-time 100% off coupon for 1 month
              const coupon = await stripe.coupons.create({
                percent_off: 100,
                duration: "once",
                name: `Parrainage – 1 mois offert`,
                metadata: { referral_id: referral.id, referrer_id: referral.referrer_id },
              });

              // Find referrer's active subscription
              const referrerSubs = await stripe.subscriptions.list({
                customer: referrerProfile.stripe_customer_id,
                status: "active",
                limit: 1,
              });

              if (referrerSubs.data.length > 0) {
                // Apply coupon to next invoice of the referrer's subscription
                await stripe.subscriptions.update(referrerSubs.data[0].id, {
                  coupon: coupon.id,
                });
                console.log(`Stripe coupon ${coupon.id} applied to referrer subscription ${referrerSubs.data[0].id}`);
              } else {
                // Referrer doesn't have an active subscription yet — store coupon for later
                console.log(`Referrer ${referral.referrer_id} has no active subscription yet, coupon ${coupon.id} created but not applied`);
                // Apply coupon at customer level so it's used on their first subscription
                await stripe.customers.update(referrerProfile.stripe_customer_id, {
                  coupon: coupon.id,
                });
                console.log(`Coupon ${coupon.id} applied to customer ${referrerProfile.stripe_customer_id} for next subscription`);
              }
            } else {
              console.log(`Referrer ${referral.referrer_id} has no stripe_customer_id yet`);
            }
          } catch (couponError) {
            console.error("Error creating/applying referral coupon:", couponError);
          }

          // 3. Apply Stripe coupon to the REFERRED user's subscription (1 month free)
          // The referred user just paid, so they have an active subscription
          try {
            const referredCustomerId = session.customer as string;
            const couponReferred = await stripe.coupons.create({
              percent_off: 100,
              duration: "once",
              name: `Parrainage – 1 mois offert (filleul)`,
              metadata: { referral_id: referral.id, referred_id: userId },
            });

            const referredSubs = await stripe.subscriptions.list({
              customer: referredCustomerId,
              status: "active",
              limit: 1,
            });

            if (referredSubs.data.length > 0) {
              await stripe.subscriptions.update(referredSubs.data[0].id, {
                coupon: couponReferred.id,
              });
              console.log(`Stripe coupon applied to referred user's subscription`);
            }
          } catch (couponError) {
            console.error("Error applying coupon to referred user:", couponError);
          }

          // 4. Update referral status to completed
          const { error: referralUpdateError } = await supabaseAdmin
            .from("referrals")
            .update({
              status: "completed",
              referrer_rewarded: true,
              referred_rewarded: true,
              completed_at: new Date().toISOString(),
            })
            .eq("id", referral.id);

          if (referralUpdateError) {
            console.error("Error updating referral status:", referralUpdateError);
          } else {
            console.log(`Referral ${referral.id} marked as completed`);
          }

          // 5. Send referral_completed emails to both parties
          try {
            // Get referrer info
            const { data: referrerAuth } = await supabaseAdmin.auth.admin.getUserById(referral.referrer_id);
            const { data: referrerProf } = await supabaseAdmin
              .from("profiles")
              .select("full_name")
              .eq("id", referral.referrer_id)
              .maybeSingle();

            const referrerEmail = referrerAuth?.user?.email;
            const referrerName = referrerProf?.full_name || "Cher utilisateur";

            // Get referred user info
            const { email: referredEmail, userName: referredName } = await getUserEmail(
              stripe, supabaseAdmin, session.customer as string, userId
            );

            // Email to the REFERRER: "your referral paid, you get 1 free month"
            if (referrerEmail) {
              await sendEmail("referral_completed", referrerEmail, {
                userName: referrerName,
                filleulName: referredName || "Votre filleul(e)",
                dashboardUrl: "https://www.respirfacile.fr/patients",
              });
            }

            // Email to the REFERRED: "you paid, your referral bonus is active"
            if (referredEmail) {
              await sendEmail("referral_completed", referredEmail, {
                userName: referredName || "Cher utilisateur",
                filleulName: referrerName,
                dashboardUrl: "https://www.respirfacile.fr/patients",
              });
            }
          } catch (emailError) {
            console.error("Error sending referral completed emails:", emailError);
          }
        }

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;
        
        if (!userId) {
          console.log("No user ID in subscription metadata, trying to find by customer");
          // Try to find user by stripe_customer_id
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", subscription.customer as string)
            .single();
          
          if (profile) {
            const { error } = await supabaseAdmin
              .from("profiles")
              .update({
                subscription_status: subscription.status,
                is_premium: subscription.status === "active",
                updated_at: new Date().toISOString(),
              })
              .eq("id", profile.id);
            
            if (error) {
              console.error("Error updating subscription status:", error);
            } else {
              console.log(`Subscription updated for user ${profile.id}: ${subscription.status}`);
            }
          }
        } else {
          const { error } = await supabaseAdmin
            .from("profiles")
            .update({
              subscription_status: subscription.status,
              is_premium: subscription.status === "active",
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);
          
          if (error) {
            console.error("Error updating subscription status:", error);
          } else {
            console.log(`Subscription updated for user ${userId}: ${subscription.status}`);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Find user by stripe_customer_id
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", subscription.customer as string)
          .single();
        
        if (profile) {
          // Fetch full profile to determine role
          const { data: fullProfile } = await supabaseAdmin
            .from("profiles")
            .select("id, is_therapist")
            .eq("id", profile.id)
            .single();

          const { error } = await supabaseAdmin
            .from("profiles")
            .update({
              is_premium: false,
              subscription_status: "canceled",
              updated_at: new Date().toISOString(),
            })
            .eq("id", profile.id);
          
          if (error) {
            console.error("Error canceling subscription:", error);
          } else {
            console.log(`Subscription canceled for user ${profile.id}`);
            
            // Send subscription canceled email with role-aware URL
            const { email, userName } = await getUserEmail(
              stripe,
              supabaseAdmin,
              subscription.customer as string,
              profile.id
            );
            if (email) {
              const isTherapist = fullProfile?.is_therapist === true;
              await sendEmail("subscription_canceled", email, {
                userName: userName || "Utilisateur",
                resubscribeUrl: isTherapist
                  ? "https://www.respirfacile.fr/pro/subscription"
                  : "https://www.respirfacile.fr/pricing",
              });
            }
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        
        // Find user by stripe_customer_id
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", invoice.customer as string)
          .single();
        
        if (profile) {
          // Fetch full profile to determine role
          const { data: fullProfile } = await supabaseAdmin
            .from("profiles")
            .select("id, is_therapist")
            .eq("id", profile.id)
            .single();

          const { error } = await supabaseAdmin
            .from("profiles")
            .update({
              subscription_status: "past_due",
              updated_at: new Date().toISOString(),
            })
            .eq("id", profile.id);
          
          if (error) {
            console.error("Error updating payment failed status:", error);
          } else {
            console.log(`Payment failed for user ${profile.id}`);
            
            // Send payment failed email with role-aware URL
            const { email, userName } = await getUserEmail(
              stripe,
              supabaseAdmin,
              invoice.customer as string,
              profile.id
            );
            if (email) {
              const isTherapist = fullProfile?.is_therapist === true;
              await sendEmail("payment_failed", email, {
                userName: userName || "Utilisateur",
                updatePaymentUrl: isTherapist
                  ? "https://www.respirfacile.fr/subscription/manage"
                  : "https://www.respirfacile.fr/subscription/manage",
              });
            }
          }
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        console.log(`Refund detected for customer ${charge.customer}`);
        
        if (charge.refunded) {
          // Find user by stripe_customer_id
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", charge.customer as string)
            .single();
          
          if (profile) {
            const { error } = await supabaseAdmin
              .from("profiles")
              .update({
                is_premium: false,
                subscription_status: "refunded",
                updated_at: new Date().toISOString(),
              })
              .eq("id", profile.id);
            
            if (error) {
              console.error("Error processing refund:", error);
            } else {
              console.log(`Premium disabled for user ${profile.id} after refund`);
              
              // Send refund confirmation email
              const { email, userName } = await getUserEmail(
                stripe,
                supabaseAdmin,
                charge.customer as string,
                profile.id
              );
              if (email) {
                // Format refund amount (convert from cents to euros)
                const refundAmount = charge.amount_refunded 
                  ? `${(charge.amount_refunded / 100).toFixed(2)}€` 
                  : "N/A";
                await sendEmail("refund_confirmation", email, {
                  userName: userName || "Utilisateur",
                  refundAmount,
                });
              }
            }
          } else {
            // Fallback: log email for manual investigation if customer_id not linked
            try {
              const customer = await stripe.customers.retrieve(charge.customer as string);
              if (customer && !customer.deleted && 'email' in customer) {
                console.log(`Refund detected for email: ${customer.email} - customer_id not linked to profile`);
              }
            } catch (err) {
              console.error("Error retrieving customer:", err);
            }
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed for customer ${paymentIntent.customer}, amount: ${paymentIntent.amount}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
