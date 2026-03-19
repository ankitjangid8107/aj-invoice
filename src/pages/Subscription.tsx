import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, ArrowLeft, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular: boolean;
}

export default function Subscription() {
  const { user, loading } = useAuth();
  const [currentPlan, setCurrentPlan] = useState('free');
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [plans, setPlans] = useState<PricingPlan[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('subscriptions').select('plan, status').eq('user_id', user.id).eq('status', 'active').maybeSingle()
      .then(({ data }) => { if (data) setCurrentPlan(data.plan); });
  }, [user]);

  useEffect(() => {
    supabase.from('pricing_plans').select('*').eq('is_active', true).order('sort_order')
      .then(({ data }) => { if (data) setPlans(data.map(p => ({ ...p, features: (p.features as any) || [] }))); });
  }, []);
  }, [user]);

  // Load Razorpay script
  useEffect(() => {
    if (document.getElementById('razorpay-script')) return;
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleSubscribe = async (planId: string) => {
    if (!user || plan.price === 0 || plan.name.toLowerCase() === currentPlan) return;
    setProcessingPlan(plan.id);
    setProcessingPlan(planId);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const res = await supabase.functions.invoke('razorpay', {
        body: { action: 'create_order', plan: planId },
      });

      if (res.error) throw new Error(res.error.message);
      const { order, key_id } = res.data;

      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'InvoicePro Cloud',
        description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan Subscription`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            await supabase.functions.invoke('razorpay', {
              body: {
                action: 'verify_payment',
                plan: planId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            });
            setCurrentPlan(planId);
            toast.success('Subscription activated! 🎉');
          } catch {
            toast.error('Payment verification failed');
          }
        },
        prefill: { email: user.email },
        theme: { color: '#3B82F6' },
      };

      if (!window.Razorpay) {
        toast.error('Payment system loading... Please try again.');
        setProcessingPlan(null);
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => toast.error('Payment failed. Please try again.'));
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setProcessingPlan(null);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass-panel-strong border-b border-border/50">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link to="/dashboard"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button></Link>
          <CreditCard className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold gradient-text">Subscription Plans</h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Choose Your Plan</h2>
          <p className="text-muted-foreground">Current plan: <span className="font-semibold text-primary capitalize">{currentPlan}</span></p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {plans.map(plan => (
            <motion.div key={plan.id} whileHover={{ y: -4 }}
              className={`rounded-2xl p-6 border ${plan.popular ? 'border-primary shadow-xl shadow-primary/10 ring-2 ring-primary/20' : 'border-border'} bg-card`}>
              {plan.popular && <span className="inline-block text-xs font-bold text-primary bg-primary/10 rounded-full px-3 py-1 mb-3">Most Popular</span>}
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <div className="mt-3 mb-6">
                <span className="text-4xl font-extrabold">₹{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-primary shrink-0" />{f}</li>
                ))}
              </ul>
              <Button
                className={`w-full ${plan.popular ? 'btn-3d bg-primary text-primary-foreground' : ''}`}
                variant={plan.popular ? 'default' : 'outline'}
                disabled={plan.id === currentPlan || plan.id === 'free' || !!processingPlan}
                onClick={() => handleSubscribe(plan.id)}
              >
                {plan.id === currentPlan ? '✓ Current Plan' : processingPlan === plan.id ? 'Processing...' : plan.price === 0 ? 'Free Forever' : 'Subscribe Now'}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
