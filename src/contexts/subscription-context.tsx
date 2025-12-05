'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './auth-context';
import { loadStripe, Stripe } from '@stripe/stripe-js';

export type SubscriptionPlan = 'free' | 'basic' | 'premium';

export interface SubscriptionLimits {
  aiRequestsPerDay: number;
  multiGpuEnabled: boolean;
  advancedMultiGpu: boolean;
  prioritySupport: boolean;
}

export interface Subscription {
  plan: SubscriptionPlan;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  limits: SubscriptionLimits;
}

const PLAN_LIMITS: Record<SubscriptionPlan, SubscriptionLimits> = {
  free: {
    aiRequestsPerDay: 10,
    multiGpuEnabled: false,
    advancedMultiGpu: false,
    prioritySupport: false,
  },
  basic: {
    aiRequestsPerDay: 100,
    multiGpuEnabled: true,
    advancedMultiGpu: false,
    prioritySupport: false,
  },
  premium: {
    aiRequestsPerDay: Infinity,
    multiGpuEnabled: true,
    advancedMultiGpu: true,
    prioritySupport: true,
  },
};

interface SubscriptionContextType {
  subscription: Subscription | null;
  loading: boolean;
  stripe: Stripe | null;
  checkSubscription: () => Promise<void>;
  upgradePlan: (plan: SubscriptionPlan) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  canUseFeature: (feature: keyof SubscriptionLimits) => boolean;
  getRemainingRequests: () => number;
  incrementRequestCount: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Initialize Stripe
let stripePromise: Promise<Stripe | null> | null = null;

function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.warn('Stripe publishable key not configured');
      stripePromise = Promise.resolve(null);
    } else {
      stripePromise = loadStripe(publishableKey);
    }
  }
  return stripePromise;
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [requestCount, setRequestCount] = useState(0);
  const [lastResetDate, setLastResetDate] = useState(new Date().toDateString());

  // Initialize Stripe
  useEffect(() => {
    getStripe().then(setStripe);
  }, []);

  // Reset request count daily
  useEffect(() => {
    const today = new Date().toDateString();
    if (lastResetDate !== today) {
      setRequestCount(0);
      setLastResetDate(today);
    }
  }, [lastResetDate]);

  // Load subscription from local storage or API
  const checkSubscription = useCallback(async () => {
    if (!isAuthenticated || !user) {
      // Default to free plan for unauthenticated users
      setSubscription({
        plan: 'free',
        status: 'active',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        limits: PLAN_LIMITS.free,
      });
      setLoading(false);
      return;
    }

    try {
      // Try to load from local storage first (offline-first)
      const stored = localStorage.getItem(`subscription_${user.uid}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSubscription({
          ...parsed,
          currentPeriodEnd: parsed.currentPeriodEnd ? new Date(parsed.currentPeriodEnd) : null,
        });
      }

      // Then try to fetch from API (if online)
      if (typeof window !== 'undefined' && (window as any).__TAURI__) {
        const invoke = (window as any).__TAURI__?.invoke;
        if (invoke) {
          try {
            const result = await invoke('get_subscription', { userId: user.uid });
            if (result) {
              const sub: Subscription = {
                plan: result.plan || 'free',
                status: result.status || 'active',
                currentPeriodEnd: result.currentPeriodEnd ? new Date(result.currentPeriodEnd) : null,
                cancelAtPeriodEnd: result.cancelAtPeriodEnd || false,
                limits: PLAN_LIMITS[result.plan || 'free'],
              };
              setSubscription(sub);
              localStorage.setItem(`subscription_${user.uid}`, JSON.stringify(sub));
            }
          } catch (error) {
            console.error('Error fetching subscription:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      // Fallback to free plan
      setSubscription({
        plan: 'free',
        status: 'active',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        limits: PLAN_LIMITS.free,
      });
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const upgradePlan = useCallback(async (plan: SubscriptionPlan) => {
    if (!user || !stripe) {
      throw new Error('User not authenticated or Stripe not initialized');
    }

    try {
      // Create checkout session via Tauri backend
      if (typeof window !== 'undefined' && (window as any).__TAURI__) {
        const invoke = (window as any).__TAURI__?.invoke;
        if (invoke) {
          const session = await invoke('create_checkout_session', {
            userId: user.uid,
            plan,
          });

          if (session?.url && stripe) {
            // Redirect to Stripe Checkout
            window.location.href = session.url;
          }
        }
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
      throw error;
    }
  }, [user, stripe]);

  const cancelSubscription = useCallback(async () => {
    if (!user) return;

    try {
      if (typeof window !== 'undefined' && (window as any).__TAURI__) {
        const invoke = (window as any).__TAURI__?.invoke;
        if (invoke) {
          await invoke('cancel_subscription', { userId: user.uid });
          await checkSubscription();
        }
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }, [user, checkSubscription]);

  const canUseFeature = useCallback((feature: keyof SubscriptionLimits): boolean => {
    if (!subscription) return false;
    return subscription.limits[feature] === true || subscription.limits[feature] === Infinity;
  }, [subscription]);

  const getRemainingRequests = useCallback((): number => {
    if (!subscription) return 0;
    const limit = subscription.limits.aiRequestsPerDay;
    if (limit === Infinity) return Infinity;
    return Math.max(0, limit - requestCount);
  }, [subscription, requestCount]);

  const incrementRequestCount = useCallback(() => {
    setRequestCount(prev => prev + 1);
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loading,
        stripe,
        checkSubscription,
        upgradePlan,
        cancelSubscription,
        canUseFeature,
        getRemainingRequests,
        incrementRequestCount,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
}

