// Stripe utilities
// Note: Full Stripe integration requires @stripe/stripe-js and @stripe/react-stripe-js
// These modules are declared in package.json and will be installed during deployment

export const STRIPE_PUBLIC_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

export interface StripeConfig {
  starter: string;
  pro: string;
  cabinet: string;
}

export const STRIPE_PRICES: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_STARTER || '',
  pro: process.env.STRIPE_PRICE_PRO || '',
  cabinet: process.env.STRIPE_PRICE_CABINET || ''
};

export async function createSetupIntent(therapistId: string) {
  const response = await fetch('/api/setup-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ therapist_id: therapistId })
  });
  
  if (!response.ok) throw new Error('Failed to create setup intent');
  return response.json();
}
