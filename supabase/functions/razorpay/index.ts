import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID');
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('Unauthorized');

    const body = await req.json();
    const { action, plan, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = body;

    if (action === 'create_order') {
      const orderAmount = amount || (plan === 'pro' ? 19900 : plan === 'business' ? 49900 : 0);
      if (orderAmount === 0) throw new Error('Invalid plan');

      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: orderAmount,
          currency: 'INR',
          receipt: `sub_${user.id.slice(0, 8)}_${Date.now()}`,
          notes: { user_id: user.id, plan },
        }),
      });

      const order = await response.json();
      if (!response.ok) throw new Error(`Razorpay error: ${JSON.stringify(order)}`);

      return new Response(JSON.stringify({ order, key_id: RAZORPAY_KEY_ID }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'verify_payment') {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      
      // Check if subscription exists
      const { data: existing } = await supabase.from('subscriptions')
        .select('id').eq('user_id', user.id).maybeSingle();

      if (existing) {
        await supabase.from('subscriptions').update({
          plan,
          status: 'active',
          razorpay_payment_id,
          starts_at: new Date().toISOString(),
          expires_at: expiresAt,
        }).eq('id', existing.id);
      } else {
        await supabase.from('subscriptions').insert({
          user_id: user.id,
          plan,
          status: 'active',
          razorpay_payment_id,
          starts_at: new Date().toISOString(),
          expires_at: expiresAt,
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Razorpay function error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
