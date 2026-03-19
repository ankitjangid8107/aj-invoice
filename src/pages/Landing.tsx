import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, CreditCard, Ticket, Shield, Cloud, Smartphone, ArrowRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const features = [
  { icon: FileText, title: 'Invoice Generator', desc: 'Create professional GST invoices with Amazon-style templates. Export to PDF, PNG, Word.' },
  { icon: CreditCard, title: 'Payment Receipt', desc: 'Generate UPI payment receipts instantly. Mobile-friendly exports.' },
  { icon: Ticket, title: 'Ticket Generator', desc: 'Create bus/travel e-tickets with complete traveller & fare details.' },
  { icon: Cloud, title: 'Cloud Storage', desc: 'All documents auto-saved to cloud. Access from any device, anytime.' },
  { icon: Shield, title: 'Secure & Private', desc: 'Bank-grade encryption. Your data stays yours. Role-based access control.' },
  { icon: Smartphone, title: 'Mobile Optimized', desc: 'Works perfectly on iOS & Android. Download bills on any device.' },
];

interface DynPlan { id: string; name: string; price: number; period: string; features: string[]; popular: boolean; }

export default function Landing() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<DynPlan[]>([]);

  useEffect(() => {
    supabase.from('pricing_plans').select('*').eq('is_active', true).order('sort_order')
      .then(({ data }) => { if (data) setPlans(data.map(p => ({ ...p, features: (p.features as any) || [] }))); });
  }, []);
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass-panel-strong border-b border-border/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold gradient-text">InvoicePro Cloud</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <a href="#pricing" className="hover:text-foreground transition">Pricing</a>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/dashboard">
                <Button className="btn-3d bg-primary text-primary-foreground gap-1">Dashboard <ArrowRight className="w-4 h-4" /></Button>
              </Link>
            ) : (
              <>
                <Link to={user ? "/subscription" : "/auth"}><Button variant="ghost" size="sm">Login</Button></Link>
                <Link to={user ? "/subscription" : "/auth"}><Button size="sm" className="btn-3d bg-primary text-primary-foreground">Sign Up Free</Button></Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              🚀 #1 Invoice & Receipt Generator
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight mb-6">
              Professional <span className="gradient-text">Invoices</span>,<br />
              Receipts & Tickets
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Create GST-compliant invoices, UPI payment receipts, and travel tickets in seconds. Export to PDF, PNG, Word. Works on all devices.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to={user ? "/subscription" : "/auth"}>
                <Button size="lg" className="btn-3d bg-primary text-primary-foreground text-lg px-8 gap-2">
                  Start Free <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="text-lg px-8">See Features</Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground text-lg">All-in-one platform for professional document generation</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="stat-card">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-muted-foreground text-lg">Start free. Upgrade when you need more.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {plans.map(plan => (
              <motion.div key={plan.name} whileHover={{ y: -4 }}
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
                <Link to={user ? "/subscription" : "/auth"}>
                  <Button className={`w-full ${plan.popular ? 'btn-3d bg-primary text-primary-foreground' : ''}`} variant={plan.popular ? 'default' : 'outline'}>
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid sm:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold">InvoicePro Cloud</span>
              </div>
              <p className="text-sm text-muted-foreground">Professional invoice & receipt generator for businesses of all sizes.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/dashboard" className="hover:text-foreground">Invoice Generator</Link></li>
                <li><Link to="/payment-receipt" className="hover:text-foreground">Payment Receipt</Link></li>
                <li><Link to="/ticket-editor" className="hover:text-foreground">Ticket Generator</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-foreground">Terms of Service</Link></li>
                <li><Link to="/refund" className="hover:text-foreground">Refund Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/contact" className="hover:text-foreground">Contact Us</Link></li>
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} InvoicePro Cloud. All rights reserved.
          </div>
        </div>
      </footer>

      {/* AdSense Placeholder */}
      <div id="adsense-container" />
    </div>
  );
}
