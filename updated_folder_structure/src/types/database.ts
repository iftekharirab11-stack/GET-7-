export type Profile = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};
export type Progress = {
  id: string;
  user_id: string;
  activity_type: "chat" | "writing" | "speaking";
  score: number | null;
  feedback: string | null;
  metadata: any;
  created_at: string;
};
export type Subscription = {
  id: string;
  user_id: string;
  stripe_subscription_id?: string;
  plan_type: "free" | "pro" | "team";
  status: "active" | "canceled" | "past_due";
  expiry_date?: string;
  created_at: string;
  updated_at: string;
};
