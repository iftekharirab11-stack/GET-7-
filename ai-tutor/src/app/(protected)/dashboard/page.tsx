"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { fetchUserProgress, fetchUserStats, getCurrentUserId, ProgressRecord, UserStats } from "@/lib/progress";

interface Subscription {
  status: string;
  plan_type: string;
  expiry_date: string | null;
}

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id?: string; email?: string } | null>(null);
  const [stats, setStats] = useState<UserStats>({ total_count: 0, avg_score: 0, latest_score: null });
  const [recentProgress, setRecentProgress] = useState<ProgressRecord[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  async function ensureProfile(userId: string, userEmail: string | undefined) {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (!existing) {
      await supabase.from('profiles').insert({
        id: userId,
        email: userEmail || ''
      });
    }
  }

  useEffect(() => {
    async function loadDashboardData() {
      const userId = await getCurrentUserId();

      if (!userId) {
        router.push("/login");
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser({ id: userId, email: session.user.email });
        await ensureProfile(userId, session.user.email);
      }

      const [progress, userStats] = await Promise.all([
        fetchUserProgress(userId, 10),
        fetchUserStats(userId)
      ]);

      setRecentProgress(progress);
      setStats(userStats);

      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (subData) {
        setSubscription(subData);
      }

      setLoading(false);
    }

    loadDashboardData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const activityLabels: Record<string, string> = {
    chat: 'Chat Practice',
    writing: 'Writing Practice',
    speaking: 'Speaking Practice'
  };

  const formatScore = (score: number | null) => {
    if (score === null) return '--';
    return score > 10 ? `${Math.round(score)}%` : `Band ${score}`;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}!
            </p>
          </div>
          {subscription && (
            <div className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
              {subscription.plan_type === 'free' ? 'Free Plan' : 'Pro Plan'}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <p className="text-sm text-gray-600 mb-1">Total Practice</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total_count}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <p className="text-sm text-gray-600 mb-1">Average Score</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats.avg_score > 0 ? formatScore(stats.avg_score) : '--'}
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <p className="text-sm text-gray-600 mb-1">Latest Score</p>
          <p className="text-3xl font-bold text-gray-900">{formatScore(stats.latest_score)}</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/chat" className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:border-blue-500 transition-colors">
            <h3 className="font-medium text-gray-900 mb-1">Start Chat</h3>
            <p className="text-sm text-gray-600">Practice conversational skills</p>
          </Link>
          <Link href="/writing" className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:border-blue-500 transition-colors">
            <h3 className="font-medium text-gray-900 mb-1">Writing Practice</h3>
            <p className="text-sm text-gray-600">Improve your writing skills</p>
          </Link>
          <Link href="/speaking" className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:border-blue-500 transition-colors">
            <h3 className="font-medium text-gray-900 mb-1">Speaking Practice</h3>
            <p className="text-sm text-gray-600">Enhance your speaking abilities</p>
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h2>
        {recentProgress.length > 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
            {recentProgress.map((entry) => (
              <div key={entry.id} className="flex justify-between items-center p-4 border-b border-gray-200 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">
                    {activityLabels[entry.activity_type] || entry.activity_type}
                  </p>
                  <p className="text-sm text-gray-600">{entry.feedback || 'No feedback'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{formatDate(entry.created_at)}</p>
                  <p className="font-medium text-blue-600">{formatScore(entry.score)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
            <p className="text-gray-600 mb-4">No sessions yet. Start practicing to track your progress!</p>
            <Link href="/chat" className="btn btn-primary inline-block">
              Start Practice
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}