import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.warn('Stripe publishable key not configured');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}

export async function createCheckoutSession(plan: 'basic' | 'premium', userId: string): Promise<string | null> {
  try {
    if (typeof window !== 'undefined' && (window as any).__TAURI__) {
      const invoke = (window as any).__TAURI__?.invoke;
      if (invoke) {
        const session = await invoke('create_checkout_session', {
          userId,
          plan,
        });
        return session?.url || null;
      }
    }
    return null;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return null;
  }
}

export async function redirectToCheckout(checkoutUrl: string): Promise<void> {
  if (typeof window !== 'undefined') {
    window.location.href = checkoutUrl;
  }
}

