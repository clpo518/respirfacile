# Stripe Setup Guide for Respirfacile

This guide walks through the Stripe integration for a 30-day free trial without requiring a credit card upfront.

## Architecture Overview

1. **Edge Functions** (Deno/Supabase):
   - `create-setup-intent`: Creates a Stripe SetupIntent and subscription with 30-day trial
   - `stripe-webhook`: Handles Stripe webhook events for subscription lifecycle

2. **API Route** (Next.js):
   - `app/api/setup-intent/route.ts`: Calls the Edge Function

3. **React Component**:
   - `app/components/StripeSetupForm.tsx`: Client-side form for card collection

## Setup Steps

### 1. Create Stripe Price Objects

Create three price objects in your Stripe dashboard (https://dashboard.stripe.com):

**Products & Prices → Create Product**

- **Starter Plan**
  - Name: `Starter - Respirfacile`
  - Pricing: $15/month (or €15/month if using EUR)
  - Copy the Price ID: `price_...` → Store as `STRIPE_PRICE_STARTER`

- **Pro Plan**
  - Name: `Pro - Respirfacile`
  - Pricing: $30/month (or €30/month if using EUR)
  - Copy the Price ID → Store as `STRIPE_PRICE_PRO`

- **Cabinet Plan**
  - Name: `Cabinet - Respirfacile`
  - Pricing: $55/month (or €55/month if using EUR)
  - Copy the Price ID → Store as `STRIPE_PRICE_CABINET`

### 2. Get Your Stripe Keys

From https://dashboard.stripe.com/apikeys:

- **Secret Key** (sk_test_... or sk_live_...) → `STRIPE_SECRET_KEY`
- **Publishable Key** (pk_test_... or pk_live_...) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### 3. Create a Webhook Endpoint

From https://dashboard.stripe.com/webhooks:

1. Click **Add endpoint**
2. Endpoint URL: `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the Signing Secret (whsec_...) → `STRIPE_WEBHOOK_SECRET`

### 4. Set Environment Variables

**In Supabase Dashboard (Functions Settings):**

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_CABINET=price_...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJh... (from Settings → API)
```

**In Next.js `.env.local`:**

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJh... (same as above)
```

### 5. Deploy Edge Functions

```bash
# From project root
supabase functions deploy create-setup-intent
supabase functions deploy stripe-webhook
```

### 6. Update Database Profiles Table

Ensure your `profiles` table has these columns (if not already present):

```sql
ALTER TABLE profiles ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN stripe_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN subscription_status TEXT DEFAULT 'none';
ALTER TABLE profiles ADD COLUMN subscription_tier TEXT;
ALTER TABLE profiles ADD COLUMN trial_ends_at TIMESTAMPTZ;

-- Add indexes for faster lookups
CREATE INDEX idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
CREATE INDEX idx_profiles_stripe_subscription_id ON profiles(stripe_subscription_id);
```

## Usage

### For Therapists Signing Up

1. Import and use the `StripeSetupForm` component:

```tsx
import StripeSetupForm from "@/app/components/StripeSetupForm";

export default function SignupPage() {
  const [userId, setUserId] = useState("");
  
  return (
    <div>
      <h1>Create Your Account</h1>
      {/* ... other form fields ... */}
      <StripeSetupForm
        therapistId={userId}
        plan="starter"
        onSuccess={() => {
          // Redirect to dashboard
          router.push("/dashboard");
        }}
      />
    </div>
  );
}
```

### How It Works

1. **Therapist** enters their card details in the form
2. **Frontend** calls `/api/setup-intent` with their ID and selected plan
3. **API Route** calls the Supabase Edge Function `create-setup-intent`
4. **Edge Function**:
   - Creates a Stripe Customer (if new)
   - Creates a SetupIntent for card collection
   - Creates a Subscription with 30-day trial
   - Updates the profiles table with subscription info
5. **Frontend** confirms the SetupIntent with Stripe
6. **Card is saved** for when the trial expires

### Trial Expiration

When the 30-day trial ends:

- Stripe automatically attempts to charge the saved card
- If payment succeeds → `subscription_status = 'active'`
- If payment fails → `subscription_status = 'past_due'`
- If no card saved → `subscription_status = 'canceled'` (automatically)

## Testing in Development

Use Stripe test cards:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Expiry**: Any future date (e.g., 12/25)
- **CVC**: Any 3 digits

## Important Notes

1. **SetupIntent vs PaymentIntent**: We use SetupIntent because we're only collecting the payment method during the trial, not charging immediately.

2. **Trial Settings**: The `trial_settings.end_behavior.missing_payment_method = 'cancel'` means if the customer doesn't save a payment method, the subscription auto-cancels at trial end.

3. **Webhook Idempotency**: The webhook handler checks `subscription_id` to avoid processing the same event twice. Stripe may retry webhook delivery.

4. **Customer Metadata**: The Stripe customer is created with `therapist_id` in metadata for debugging.

5. **Trial Dates**: We store `trial_ends_at` in the profiles table for your UI to display countdown.

## Troubleshooting

### "Missing STRIPE_SECRET_KEY" Error

- Ensure all environment variables are set in Supabase Dashboard
- Redeploy the functions after setting env vars

### Card Confirmation Fails

- Check browser console for Stripe.js errors
- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is correct
- Try a different test card

### Webhook Events Not Firing

- Verify the webhook endpoint URL is correct
- Check Stripe Dashboard → Webhooks → Recent events
- Ensure webhook secret matches between Stripe dashboard and env var

### Trial End Date Not Set

- Check that the Edge Function completed successfully
- Verify `SUPABASE_SERVICE_ROLE_KEY` has admin permissions
- Check database for the updated profile record

## Future Enhancements

1. **Email Notifications**: Send reminder emails at trial day 7, 14, 27
2. **Dunning**: Implement retry logic for failed payments
3. **Cancellation Flow**: Allow therapists to cancel before trial ends
4. **Multiple Plans**: Add upgrade/downgrade during active subscription
5. **Invoices**: Generate and email PDF invoices after each charge
