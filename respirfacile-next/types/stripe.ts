/**
 * Stripe integration types for Respirfacile
 */

export type SubscriptionPlan = "starter" | "pro" | "cabinet";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "none";

export interface StripeCustomer {
  id: string;
  email: string;
  metadata: {
    therapist_id: string;
  };
}

export interface StripeSubscription {
  id: string;
  customer: string;
  items: {
    data: Array<{
      price: {
        id: string;
        product: string;
      };
    }>;
  };
  status: "trialing" | "active" | "past_due" | "canceled" | "incomplete";
  current_period_start: number;
  current_period_end: number;
  trial_start: number | null;
  trial_end: number | null;
}

export interface SetupIntentResponse {
  client_secret: string;
  customer_id: string;
  subscription_id: string;
  trial_ends_at: string;
}

export interface StripeWebhookEvent {
  id: string;
  object: "event";
  type:
    | "customer.subscription.updated"
    | "customer.subscription.deleted"
    | "invoice.payment_succeeded"
    | "invoice.payment_failed";
  data: {
    object: Record<string, unknown>;
  };
  created: number;
}

/**
 * Profile columns related to Stripe subscription
 */
export interface ProfileSubscriptionFields {
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: SubscriptionStatus;
  subscription_tier: SubscriptionPlan | null;
  trial_ends_at: string | null;
}

/**
 * Request/Response types for the setup-intent API
 */
export interface SetupIntentRequest {
  therapist_id: string;
  plan?: SubscriptionPlan;
}

export interface SetupIntentErrorResponse {
  error: string;
}
