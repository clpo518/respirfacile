# Stripe Integration Implementation Summary

## Overview

Complete Stripe payment integration for Respirfacile with a 30-day free trial, no credit card required upfront. The flow uses Stripe SetupIntent to collect payment information after the trial period.

## Files Created

### 1. Edge Functions (Supabase Deno)

**`supabase/functions/create-setup-intent/index.ts`**
- Creates or retrieves Stripe customer
- Creates SetupIntent for payment method collection
- Creates subscription with 30-day trial
- Updates profiles table with subscription metadata
- Handles errors gracefully

**`supabase/functions/stripe-webhook/index.ts`**
- Verifies Stripe webhook signatures
- Handles four key events:
  - `customer.subscription.updated` → Updates subscription status
  - `customer.subscription.deleted` → Marks subscription as canceled
  - `invoice.payment_succeeded` → Activates subscription after trial
  - `invoice.payment_failed` → Sets subscription to past_due
- Idempotent processing to handle webhook retries
- Maps Stripe statuses to app subscription statuses

### 2. Next.js API Routes

**`app/api/setup-intent/route.ts`**
- POST endpoint that calls the Supabase Edge Function
- Validates request and handles errors
- Returns SetupIntent client secret for frontend
- Sets up middleware for proper CORS and content-type headers

### 3. React Components

**`app/components/StripeSetupForm.tsx`**
- Client-side component using `@stripe/react-stripe-js`
- Displays CardElement for card input
- Shows user-friendly trial messaging
- Handles form submission and card confirmation
- Success/error notifications via sonner toasts
- Accessible labels and error messages in French

### 4. Utility Modules

**`lib/stripe.ts`**
- `getStripe()`: Lazy-loads Stripe instance
- `setupPaymentMethod()`: Calls API to create setup intent
- `getTrialEndDate()`: Parses trial end date
- `isTrialActive()`: Checks if trial is still valid
- `getDaysUntilTrialEnd()`: Returns remaining trial days

**`types/stripe.ts`**
- TypeScript types for all Stripe objects
- Type definitions for API requests/responses
- Profile subscription fields interface
- WebhookEvent types for type-safe handler code

### 5. Configuration & Documentation

**`.env.example`**
- Template for Next.js environment variables
- Placeholders for all required Stripe and Supabase keys

**`supabase/functions/.env.example`**
- Template for Edge Function environment variables
- Includes Stripe API keys and pricing IDs

**`STRIPE_SETUP.md`**
- Complete setup guide (8 sections)
- Step-by-step Stripe dashboard configuration
- Environment variable setup
- Edge Function deployment
- Database schema updates
- Usage examples
- Testing instructions with test cards
- Troubleshooting guide

**`IMPLEMENTATION_SUMMARY.md`** (this file)
- Overview of all files and their purposes
- TODO items with specific locations
- Environment variable requirements
- Database schema requirements
- Next steps for integration

**`package.json`** (updated)
- Added `@stripe/react-stripe-js`, `@stripe/stripe-js`, `stripe` dependencies

## TODO Items (Environment & Setup)

### Stripe Dashboard Configuration

- [ ] **Create Price Objects** in Stripe Dashboard
  - [ ] Starter: €15/month → Copy price ID to `STRIPE_PRICE_STARTER`
  - [ ] Pro: €30/month → Copy price ID to `STRIPE_PRICE_PRO`
  - [ ] Cabinet: €55/month → Copy price ID to `STRIPE_PRICE_CABINET`

- [ ] **Get API Keys** from https://dashboard.stripe.com/apikeys
  - [ ] Secret Key (sk_test_...) → `STRIPE_SECRET_KEY`
  - [ ] Publishable Key (pk_test_...) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

- [ ] **Configure Webhook** at https://dashboard.stripe.com/webhooks
  - [ ] URL: `https://your-project.supabase.co/functions/v1/stripe-webhook`
  - [ ] Events: subscription.updated, subscription.deleted, invoice.payment_*, etc.
  - [ ] Signing Secret (whsec_...) → `STRIPE_WEBHOOK_SECRET`

### Supabase Configuration

- [ ] **Set Environment Variables** in Supabase Dashboard → Functions Settings
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET`
  - [ ] `STRIPE_PRICE_STARTER`
  - [ ] `STRIPE_PRICE_PRO`
  - [ ] `STRIPE_PRICE_CABINET`
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`

- [ ] **Deploy Edge Functions**
  ```bash
  supabase functions deploy create-setup-intent
  supabase functions deploy stripe-webhook
  ```

- [ ] **Update Database Schema** (if columns don't exist)
  ```sql
  ALTER TABLE profiles ADD COLUMN stripe_customer_id TEXT;
  ALTER TABLE profiles ADD COLUMN stripe_subscription_id TEXT;
  ALTER TABLE profiles ADD COLUMN subscription_status TEXT DEFAULT 'none';
  ALTER TABLE profiles ADD COLUMN subscription_tier TEXT;
  ALTER TABLE profiles ADD COLUMN trial_ends_at TIMESTAMPTZ;
  
  CREATE INDEX idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
  CREATE INDEX idx_profiles_stripe_subscription_id ON profiles(stripe_subscription_id);
  ```

### Next.js Application Setup

- [ ] **Install Dependencies**
  ```bash
  npm install
  # or
  yarn install
  ```

- [ ] **Configure Environment Variables** in `.env.local`
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

- [ ] **Integrate StripeSetupForm** into signup flow
  - [ ] Import: `import StripeSetupForm from "@/app/components/StripeSetupForm"`
  - [ ] Use in signup page with therapist ID and plan selection
  - [ ] Add success/error callbacks for post-signup navigation

- [ ] **Add Protected Routes** to check subscription status
  - [ ] Check `subscription_status` field in profiles table
  - [ ] Allow "trialing" and "active" statuses to access features
  - [ ] Show upgrade prompt for "canceled" or "past_due" subscriptions

## Data Flow

### Signup Flow (New Therapist)

1. Therapist fills signup form with name, email, etc.
2. Create profile with `role='therapist'` and generate `therapist_code='PRO-XXXXX'`
3. Display StripeSetupForm component
4. User enters card details and submits
5. Component calls `/api/setup-intent` with `therapist_id` and `plan`
6. API calls Supabase Edge Function `create-setup-intent`
7. Edge Function:
   - Creates Stripe Customer
   - Creates SetupIntent
   - Creates Subscription with 30-day trial
   - Updates profiles: stripe_customer_id, stripe_subscription_id, subscription_status='trialing', trial_ends_at
8. Component confirms SetupIntent with Stripe.js
9. On success, card is saved for when trial expires
10. Therapist redirected to onboarding/dashboard

### Trial Expiration Flow (Day 30+)

1. Stripe checks subscription at `trial_end` date
2. Stripe attempts to charge the saved payment method
3. **If charge succeeds**:
   - Stripe sends `invoice.payment_succeeded` webhook
   - Edge Function updates: subscription_status='active'
4. **If charge fails**:
   - Stripe sends `invoice.payment_failed` webhook
   - Edge Function updates: subscription_status='past_due'
   - Stripe retries payment (configurable)
5. **If no payment method**:
   - Subscription auto-cancels (due to trial_settings)
   - Stripe sends `customer.subscription.deleted` webhook
   - Edge Function updates: subscription_status='canceled'

### Subscription Management

- **Upgrade/Downgrade**: Update Stripe subscription via Stripe API/Dashboard
- **Cancellation**: Delete subscription via Stripe Dashboard or API
- **Webhooks** keep profiles table in sync with Stripe state

## Limitations & Notes

### Current Implementation

- Uses **SetupIntent** for deferred charging (not immediate PaymentIntent)
- Only supports **card payments** (SEPA, Sofort, etc. not included)
- **No dunning/retry logic** for failed payments (Stripe's default is used)
- **No customer portal** for self-service cancellation/billing
- **No invoice generation/emailing** (can be added later)
- **French UI only** (email notifications would need translation)

### Security Considerations

- All Stripe keys are server-side or restricted to public key
- SetupIntent + CardElement ensures PCI compliance
- Webhook signature verification prevents forgery
- Supabase RLS should prevent cross-customer data access
- Service Role Key only used in Edge Functions, not on client

### Performance

- Stripe customer creation happens on first signup (one-time)
- SetupIntent creation is fast (<100ms)
- Subscription creation includes invoice generation (standard Stripe)
- Webhook processing is asynchronous

## Testing Checklist

### Development (Using Test Keys)

- [ ] Signup form loads without errors
- [ ] Card element displays correctly
- [ ] Submit with valid test card (4242 4242 4242 4242)
- [ ] SetupIntent is created (check Stripe dashboard)
- [ ] Profile is updated with subscription_status='trialing'
- [ ] trial_ends_at is 30 days in the future
- [ ] Submit with decline card (4000 0000 0000 0002) → error handling
- [ ] Webhook endpoint receives events (test via Stripe CLI)

### Live (Using Live Keys)

- [ ] Switch to live keys in Stripe dashboard
- [ ] Test with real card (small amount)
- [ ] Verify customer and subscription in Stripe dashboard
- [ ] Confirm email receipt from Stripe
- [ ] Wait for trial expiration or manually invoice in Stripe
- [ ] Verify subscription status updates via webhook

## Next Steps

1. **Get Stripe Keys**: Sign up for Stripe, create products and prices
2. **Configure Environment**: Set all TODO env variables
3. **Deploy Edge Functions**: Use Supabase CLI
4. **Update Database**: Add subscription columns to profiles table
5. **Integrate Component**: Add StripeSetupForm to signup flow
6. **Test Signup**: Try the full flow with test cards
7. **Monitor Webhooks**: Check Stripe dashboard for successful deliveries
8. **Verify Database**: Confirm profiles are updated after each signup
9. **Set Up Monitoring**: Add logging/alerting for failed webhooks
10. **Plan Future**: Discuss customer portal, dunning, invoicing

## Reference Files

- **Stripe Docs**: https://stripe.com/docs/billing/subscriptions/setup-future-payments
- **SetupIntent Guide**: https://stripe.com/docs/payments/setup-future-payments
- **Webhook Signing**: https://stripe.com/docs/webhooks/signatures
- **Supabase Functions**: https://supabase.com/docs/guides/functions
- **Stripe.js Reference**: https://stripe.com/docs/js
- **React Stripe Library**: https://stripe.com/docs/stripe-js/react
