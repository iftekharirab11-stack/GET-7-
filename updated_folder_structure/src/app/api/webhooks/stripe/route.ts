import { NextRequest } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    return Response.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const supabase = await createClient();
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      const subscriptionId = session.subscription as string;
      if (userId && subscriptionId) {
        await supabase.from("subscriptions").upsert({ user_id: userId, stripe_subscription_id: subscriptionId, plan_type: "pro", status: "active", updated_at: new Date().toISOString() });
      }
      break;
    case "customer.subscription.deleted":
      const subscription = event.data.object as Stripe.Subscription;
      await supabase.from("subscriptions").update({ status: "canceled", plan_type: "free" }).eq("stripe_subscription_id", subscription.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  return Response.json({ received: true });
}