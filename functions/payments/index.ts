import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import Stripe from 'https://esm.sh/stripe@14.17.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID')!;
const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET')!;
const paypalWebhookId = Deno.env.get('PAYPAL_WEBHOOK_ID')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });

// Zod schemas
const WebhookSchema = z.object({
  // Generic
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(req.url);
  const path = url.pathname.split('/').pop();

  try {
    if (path === 'stripe_webhook') {
      return await handleStripeWebhook(req);
    } else if (path === 'paypal_webhook') {
      return await handlePayPalWebhook(req);
    } else {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleStripeWebhook(req: Request): Promise<Response> {
  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    return new Response(JSON.stringify({ error: 'No signature' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, stripeWebhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleStripeSubscriptionUpdate(event.data.object as Stripe.Subscription);
      break;
    case 'customer.subscription.deleted':
      await handleStripeSubscriptionCancel(event.data.object as Stripe.Subscription);
      break;
    case 'invoice.payment_succeeded':
      await handleStripePaymentSucceeded(event.data.object as Stripe.Invoice);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleStripeSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const status = subscription.status === 'active' ? 'active' : subscription.status === 'past_due' ? 'past_due' : 'canceled';
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

  // Assume we have a way to link customer to profile
  // For simplicity, assume customer.metadata has profile_id
  const profileId = subscription.metadata?.profile_id;
  if (!profileId) return;

  const tier = subscription.metadata?.tier as 'free' | 'owner_featured' | 'realtor_pro';

  await supabase
    .from('subscriptions')
    .upsert({
      profile_id: profileId,
      tier,
      provider: 'stripe',
      status,
      current_period_end: currentPeriodEnd.toISOString(),
    });
}

async function handleStripeSubscriptionCancel(subscription: Stripe.Subscription) {
  const profileId = subscription.metadata?.profile_id;
  if (!profileId) return;

  await supabase
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('profile_id', profileId)
    .eq('provider', 'stripe');
}

async function handleStripePaymentSucceeded(invoice: Stripe.Invoice) {
  // Update status to active if payment succeeded
  const subscriptionId = invoice.subscription as string;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await handleStripeSubscriptionUpdate(subscription);
}

async function handlePayPalWebhook(req: Request): Promise<Response> {
  const body = await req.json();
  const transmissionId = req.headers.get('paypal-transmission-id');
  const transmissionTime = req.headers.get('paypal-transmission-time');
  const transmissionSig = req.headers.get('paypal-transmission-sig');
  const certUrl = req.headers.get('paypal-cert-url');
  const authAlgo = req.headers.get('paypal-auth-algo');

  // Verify signature (simplified)
  // In real implementation, verify using PayPal SDK or crypto

  const event = body;

  switch (event.event_type) {
    case 'BILLING.SUBSCRIPTION.CREATED':
    case 'BILLING.SUBSCRIPTION.UPDATED':
      await handlePayPalSubscriptionUpdate(event.resource);
      break;
    case 'BILLING.SUBSCRIPTION.CANCELLED':
      await handlePayPalSubscriptionCancel(event.resource);
      break;
    case 'PAYMENT.SALE.COMPLETED':
      await handlePayPalPaymentSucceeded(event.resource);
      break;
    default:
      console.log(`Unhandled event type ${event.event_type}`);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handlePayPalSubscriptionUpdate(subscription: any) {
  const profileId = subscription.custom_id; // Assume custom_id is profile_id
  const status = subscription.status === 'ACTIVE' ? 'active' : subscription.status === 'SUSPENDED' ? 'past_due' : 'canceled';
  const currentPeriodEnd = new Date(subscription.billing_info?.next_billing_time);

  const tier = subscription.plan_id; // Map plan_id to tier

  await supabase
    .from('subscriptions')
    .upsert({
      profile_id: profileId,
      tier,
      provider: 'paypal',
      status,
      current_period_end: currentPeriodEnd.toISOString(),
    });
}

async function handlePayPalSubscriptionCancel(subscription: any) {
  const profileId = subscription.custom_id;
  await supabase
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('profile_id', profileId)
    .eq('provider', 'paypal');
}

async function handlePayPalPaymentSucceeded(sale: any) {
  // Similar to Stripe
}