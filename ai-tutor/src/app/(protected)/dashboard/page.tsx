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
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background">
        <div className="w-8 h-8 border-4 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(0,242,254,0.5)]" />
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'TODAY';
    if (days === 1) return 'YESTERDAY';
    if (days < 7) return `${days} DAYS AGO`;
    return date.toLocaleDateString();
  };

  const activityLabels: Record<string, string> = {
    chat: 'CHAT PRACTICE',
    writing: 'WRITING PRACTICE',
    speaking: 'SPEAKING PRACTICE'
  };

  const formatScore = (score: number | null) => {
    if (score === null) return '--';
    return score > 10 ? `${Math.round(score)}%` : `BAND ${score}`;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-background min-h-screen">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-[var(--accent-cyan)] mb-1 font-mono uppercase tracking-wider">
              DASHBOARD // COMMAND CENTER
            </h1>
            <p className="text-[var(--muted)] font-mono uppercase tracking-wider">
              Welcome back{user?.email ? `, ${user.email.split("@")[0].toUpperCase()}` : ""}!
            </p>
          </div>
          {subscription && (
            <div className={`px-3 py-1 rounded-full text-sm font-medium font-mono uppercase tracking-wider ${
              subscription.plan_type === 'free' 
                ? 'bg-[var(--surface-elevated)] text-[var(--muted)] border border-[var(--border)]' 
                : 'bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] shadow-[0_0_15px_rgba(0,242,254,0.3)]'
            }`}>
              {subscription.plan_type === 'free' ? 'FREE PLAN' : 'PRO PLAN'}
            </div>
          )}
        </div>
      </div>

      {/* Goal Timeline */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4 font-mono uppercase tracking-wider">
          TARGET TIMELINE // IELTS MISSION
        </h2>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-sm text-[var(--muted)] font-mono uppercase">CURRENT BAND</span>
              <div className="text-3xl font-bold text-[var(--accent-cyan)]">
                {stats.avg_score > 0 ? formatScore(stats.avg_score) : 'BAND 6.0'}
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm text-[var(--muted)] font-mono uppercase">TARGET</span>
              <div className="text-3xl font-bold text-[var(--accent-red)]">BAND 7.5</div>
            </div>
          </div>
          <div className="relative h-2 bg-[var(--surface-elevated)] rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-purple)] rounded-full" 
                 style={{ width: '60%' }}></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-[var(--accent-red)] rounded-full shadow-[0_0_15px_rgba(200,16,46,0.8)]"></div>
          </div>
          <div className="mt-2 text-xs text-[var(--muted)] font-mono uppercase">
            UNIVERSITY OF LONDON APPLICATION: 45 DAYS REMAINING
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card">
          <p className="text-sm text-[var(--muted)] mb-1 font-mono uppercase tracking-wider">TOTAL PRACTICE</p>
          <p className="text-3xl font-bold text-[var(--accent-cyan)]">{stats.total_count}</p>
        </div>
        <div className="card">
          <p className="text-sm text-[var(--muted)] mb-1 font-mono uppercase tracking-wider">AVERAGE SCORE</p>
          <p className="text-3xl font-bold text-[var(--accent-purple)]">
            {stats.avg_score > 0 ? formatScore(stats.avg_score) : '--'}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-[var(--muted)] mb-1 font-mono uppercase tracking-wider">LATEST SCORE</p>
          <p className="text-3xl font-bold text-[var(--accent-red)]">{formatScore(stats.latest_score)}</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4 font-mono uppercase tracking-wider">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/chat" className="card transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,242,254,0.3)]">
            <h3 className="font-medium text-[var(--foreground)] mb-1 font-mono uppercase">CHAT // INITIATE</h3>
            <p className="text-sm text-[var(--muted)] font-mono">Practice conversational skills</p>
          </Link>
          <Link href="/writing" className="card transition-all duration-300 hover:shadow-[0_0_20px_rgba(189,0,255,0.3)]">
            <h3 className="font-medium text-[var(--foreground)] mb-1 font-mono uppercase">WRITING // ANALYZE</h3>
            <p className="text-sm text-[var(--muted)] font-mono">Improve your writing skills</p>
          </Link>
          <Link href="/speaking" className="card transition-all duration-300 hover:shadow-[0_0_20px_rgba(200,16,46,0.3)]">
            <h3 className="font-medium text-[var(--foreground)] mb-1 font-mono uppercase">SPEAKING // RECORD</h3>
            <p className="text-sm text-[var(--muted)] font-mono">Enhance your speaking abilities</p>
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4 font-mono uppercase tracking-wider">RECENT SESSIONS</h2>
        {recentProgress.length > 0 ? (
          <div className="card">
            {recentProgress.map((entry) => (
              <div key={entry.id} className="flex justify-between items-center p-4 border-b border-[var(--border)] last:border-b-0">
                <div>
                  <p className="font-medium text-[var(--foreground)] font-mono uppercase">
                    {activityLabels[entry.activity_type] || entry.activity_type}
                  </p>
                  <p className="text-sm text-[var(--muted)] font-mono">{entry.feedback || 'No feedback'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[var(--muted)] font-mono">{formatDate(entry.created_at)}</p>
                  <p className="font-medium text-[var(--accent-cyan)]">{formatScore(entry.score)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <p className="text-[var(--muted)] mb-4 font-mono uppercase">No sessions yet. Start practicing to track your progress!</p>
            <Link href="/chat" className="btn btn-primary inline-block">
              START PRACTICE
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}