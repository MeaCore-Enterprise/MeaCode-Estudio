'use client';

import { useState } from 'react';
import { useSubscription } from '@/contexts/subscription-context';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Zap, Crown, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function SubscriptionPanel() {
  const { subscription, loading, upgradePlan, cancelSubscription, getRemainingRequests } = useSubscription();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const remainingRequests = getRemainingRequests();
  const isUnlimited = remainingRequests === Infinity;

  const plans = [
    {
      id: 'free' as const,
      name: 'Free',
      price: '$0',
      period: 'forever',
      icon: Sparkles,
      features: [
        '10 AI requests per day',
        'Basic editor features',
        'Community support',
      ],
      current: subscription?.plan === 'free',
    },
    {
      id: 'basic' as const,
      name: 'Basic',
      price: '$9.99',
      period: 'month',
      icon: Zap,
      features: [
        '100 AI requests per day',
        'Multi-GPU basic support',
        'All editor features',
        'Email support',
      ],
      current: subscription?.plan === 'basic',
    },
    {
      id: 'premium' as const,
      name: 'Premium',
      price: '$19.99',
      period: 'month',
      icon: Crown,
      features: [
        'Unlimited AI requests',
        'Advanced Multi-GPU',
        'Priority support',
        'Early access to features',
        'Advanced Code Canvas',
      ],
      current: subscription?.plan === 'premium',
    },
  ];

  const handleUpgrade = async (plan: 'basic' | 'premium') => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to upgrade your plan.',
        variant: 'destructive',
      });
      return;
    }

    setIsUpgrading(true);
    try {
      await upgradePlan(plan);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start checkout. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelSubscription();
      toast({
        title: 'Subscription canceled',
        description: 'Your subscription will remain active until the end of the billing period.',
      });
      setShowCancelDialog(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <header className="border-b p-4">
        <h2 className="font-semibold text-lg">Subscription</h2>
        <p className="text-sm text-muted-foreground">Manage your subscription and billing.</p>
      </header>

      <div className="p-4 space-y-6">
        {/* Current Plan Status */}
        {subscription && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>
                    {subscription.status === 'active' ? 'Active subscription' : 'Subscription inactive'}
                  </CardDescription>
                </div>
                <Badge variant={subscription.plan === 'premium' ? 'default' : 'secondary'}>
                  {subscription.plan.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription.plan !== 'free' && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">AI Requests Remaining</span>
                    <span className="font-medium">
                      {isUnlimited ? 'Unlimited' : `${remainingRequests} / ${subscription.limits.aiRequestsPerDay}`}
                    </span>
                  </div>
                  {subscription.currentPeriodEnd && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Renews on</span>
                      <span className="font-medium">
                        {subscription.currentPeriodEnd.toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {subscription.cancelAtPeriodEnd && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        Your subscription will cancel at the end of the billing period.
                      </p>
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    onClick={() => setShowCancelDialog(true)}
                    className="w-full"
                  >
                    Cancel Subscription
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Available Plans */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Available Plans</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrent = plan.current;
              const isUpgrade = !isCurrent && subscription && (
                (subscription.plan === 'free' && plan.id !== 'free') ||
                (subscription.plan === 'basic' && plan.id === 'premium')
              );

              return (
                <Card key={plan.id} className={isCurrent ? 'border-primary' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="h-6 w-6 text-primary" />
                      {isCurrent && <Badge>Current</Badge>}
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">{plan.price}</span>
                      <span className="text-sm text-muted-foreground">/{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {isUpgrade && (
                      <Button
                        className="w-full"
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={isUpgrading || !isAuthenticated}
                      >
                        {isUpgrading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Upgrade'
                        )}
                      </Button>
                    )}
                    {isCurrent && plan.id !== 'free' && (
                      <Button variant="outline" className="w-full" disabled>
                        Current Plan
                      </Button>
                    )}
                    {!isCurrent && !isUpgrade && plan.id !== 'free' && (
                      <Button variant="outline" className="w-full" disabled>
                        Downgrade
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              Your subscription will remain active until the end of the current billing period.
              You will lose access to premium features after that date.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground">
              Cancel Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

