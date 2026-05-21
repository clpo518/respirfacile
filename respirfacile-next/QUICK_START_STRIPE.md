# Stripe Integration - Quick Start Checklist

Copy this list and tick off each item as you complete it.

## Phase 1: Stripe Account Setup (30 mins)

- [ ] Create Stripe account at https://stripe.com
- [ ] Switch to Live mode (if going to production)
- [ ] Navigate to Products → Create 3 products:

```
Starter Plan
├─ Name: "Starter - Respirfacile"
├─ Price: €15/month (recurring)
└─ ID: STRIPE_PRICE_STARTER = price_xxx

Pro Plan
├─ Name: "Pro - Respirfacile"
├─ Price: €30/month (recurring)
└─ ID: STRIPE_PRICE_PRO = price_xxx

Cabinet Plan
├─ Name: "Cabinet - Respirfacile"
├─ Price: €55/month (recurring)
└─ ID: STRIPE_PRICE_CABINET = price_xxx
```

- [ ] Get API keys from https://dashboard.stripe.com/apikeys:
  - [ ] `STRIPE_SECRET_KEY` = sk_test_... or sk_live_...
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = pk_test_... or pk_live_...

## Phase 2: Webhook Setup (15 mins)

- [ ] Go to https://dashboard.stripe.com/webhooks
- [ ] Add endpoint:
  - URL: `https://[PROJECT_ID].supabase.co/functions/v1/stripe-webhook`
  - Events:
    - ✓ customer.subscription.updated
    - ✓ customer.subscription.deleted
    - ✓ invoice.payment_succeeded
    - ✓ invoice.payment_failed
  - Copy signing secret: `STRIPE_WEBHOOK_SECRET` = whsec_...

## Phase 3: Supabase Setup (20 mins)

- [ ] Ensure profiles table has columns:
  ```sql
  stripe_customer_id TEXT
  stripe_subscription_id TEXT
  subscription_status TEXT DEFAULT 'none'
  subscription_tier TEXT
  trial_ends_at TIMESTAMPTZ
  ```

- [ ] Set environment variables in Supabase Dashboard → Functions → Settings:
  ```
  STRIPE_SECRET_KEY = sk_test_...
  STRIPE_WEBHOOK_SECRET = whsec_...
  STRIPE_PRICE_STARTER = price_...
  STRIPE_PRICE_PRO = price_...
  STRIPE_PRICE_CABINET = price_...
  SUPABASE_URL = https://[project].supabase.co
  SUPABASE_SERVICE_ROLE_KEY = eyJh... (from Settings → API)
  ```

- [ ] Deploy functions:
  ```bash
  supabase functions deploy create-setup-intent
  supabase functions deploy stripe-webhook
  ```

## Phase 4: Next.js Setup (15 mins)

- [ ] Install dependencies: `npm install`

- [ ] Create `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
  SUPABASE_SERVICE_ROLE_KEY=eyJh...
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
  ```

- [ ] Verify files exist:
  - [ ] `app/components/StripeSetupForm.tsx`
  - [ ] `app/api/setup-intent/route.ts`
  - [ ] `lib/stripe.ts`
  - [ ] `types/stripe.ts`

## Phase 5: Integration (30 mins)

- [ ] Add StripeSetupForm to your signup page:
  ```tsx
  import StripeSetupForm from "@/app/components/StripeSetupForm";

  export default function SignupPage() {
    const [userId, setUserId] = useState("");
    const router = useRouter();

    return (
      <StripeSetupForm
        therapistId={userId}
        plan="starter"
        onSuccess={() => router.push("/dashboard")}
      />
    );
  }
  ```

- [ ] Add subscription checks in protected routes:
  ```tsx
  // Check if subscription_status is 'trialing' or 'active'
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .single();

  if (!["trialing", "active"].includes(profile.subscription_status)) {
    redirect("/upgrade");
  }
  ```

## Phase 6: Testing (45 mins)

- [ ] **Test card**: `4242 4242 4242 4242` (success)
- [ ] Complete signup form
- [ ] Enter test card and submit
- [ ] Verify in Stripe Dashboard:
  - [ ] Customer created
  - [ ] Subscription created with trial_period_days=30
  - [ ] SetupIntent succeeded
- [ ] Check database:
  - [ ] Profile updated with stripe_customer_id
  - [ ] subscription_status = 'trialing'
  - [ ] trial_ends_at = today + 30 days
- [ ] Test error case with `4000 0000 0000 0002` (decline)
- [ ] Verify error message displays

## Phase 7: Monitoring (Ongoing)

- [ ] Set up Stripe dashboard alert for failed webhooks
- [ ] Monitor Stripe webhook delivery:
  - [ ] Dashboard → Webhooks → stripe-webhook endpoint
  - [ ] Check "Recent events" for processing status
- [ ] Add logging to track:
  - [ ] Signup form submissions
  - [ ] SetupIntent creation success/failures
  - [ ] Webhook event processing
- [ ] Create dashboard query to show:
  - [ ] Total trialing therapists
  - [ ] Active subscriptions
  - [ ] Past due/canceled counts

## Phase 8: Future Features (Optional)

- [ ] Email reminders at trial day 7, 14, 27
- [ ] Customer portal for self-service billing
- [ ] Upgrade/downgrade between plans
- [ ] Invoice PDF generation
- [ ] Dunning/retry logic for failed payments
- [ ] Cancel subscription before trial ends

---

## Test Data

**Stripe Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Require auth: `4000 2500 0000 3155`
- Any future date: `12/25`
- Any CVC: `123`

**Test Webhook Events:**
Use Stripe CLI to test webhooks locally:
```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
stripe trigger customer.subscription.updated
```

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| "Missing STRIPE_SECRET_KEY" | Check Supabase Dashboard → Functions → Settings env vars |
| "Card element not found" | Ensure CardElement is rendered in form |
| "SetupIntent client_secret is null" | Check API response, verify therapist_id is valid |
| "Webhook not receiving events" | Verify webhook URL is correct, check Stripe dashboard delivery logs |
| "Profile not updated with subscription" | Check database permissions, verify Service Role Key has access |

---

## Support Resources

- Stripe Docs: https://stripe.com/docs
- Supabase Functions: https://supabase.com/docs/guides/functions
- React Stripe: https://stripe.com/docs/stripe-js/react
- Troubleshooting: See `STRIPE_SETUP.md` for detailed guide

**Done! 🎉 Your Stripe integration is ready to accept paying therapists.**
