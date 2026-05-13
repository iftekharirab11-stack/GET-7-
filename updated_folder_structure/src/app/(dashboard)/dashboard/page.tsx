"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { useProgress } from "@/lib/hooks/useProgress";
import { useSubscription } from "@/lib/hooks/useSubscription";

export default function Dashboard() {
  const { user } = useAuth();
  const { stats, recentProgress, loading: progressLoading } = useProgress();
  const { subscription, loading: subLoading } = useSubscription();

  if (progressLoading || subLoading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin" /></div>;
  }

  const formatScore = (score: number | null) => {
    if (score === null) return "--";
    return score > 10 ? `${Math.round(score)}%` : `BAND ${score}`;
  };

  const activityLabels: Record<string, string> = { chat: "CHAT PRACTICE", writing: "WRITING PRACTICE", speaking: "SPEAKING PRACTICE" };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-background min-h-screen">
      <div className="mb-8 flex justify-between items-start">
        <div><h1 className="text-2xl font-bold text-accent-cyan mb-1 font-mono uppercase tracking-wider">DASHBOARD // COMMAND CENTER</h1><p className="text-muted font-mono uppercase">Welcome back{user?.email ? `, ${user.email.split("@")[0].toUpperCase()}` : ""}!</p></div>
        {subscription && (<div className={`px-3 py-1 rounded-full text-sm font-mono uppercase ${subscription.plan_type === 'free' ? 'bg-surface-elevated text-muted border border-border' : 'bg-accent-cyan/20 text-accent-cyan shadow-neon'}`}>{subscription.plan_type === 'free' ? 'FREE PLAN' : 'PRO PLAN'}</div>)}
      </div>
      <div className="mb-8"><h2 className="text-lg font-semibold text-foreground mb-4 font-mono uppercase">TARGET TIMELINE // IELTS MISSION</h2><div className="card p-6"><div className="flex justify-between mb-4"><div><span className="text-sm text-muted font-mono uppercase">CURRENT BAND</span><div className="text-3xl font-bold text-accent-cyan">{stats.avg_score > 0 ? formatScore(stats.avg_score) : 'BAND 6.0'}</div></div><div className="text-right"><span className="text-sm text-muted font-mono uppercase">TARGET</span><div className="text-3xl font-bold text-accent-red">BAND 7.5</div></div></div><div className="relative h-2 bg-surface-elevated rounded-full overflow-hidden"><div className="absolute inset-0 bg-gradient-to-r from-accent-cyan to-accent-purple rounded-full" style={{ width: '60%' }}></div><div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-accent-red rounded-full shadow-lg"></div></div><div className="mt-2 text-xs text-muted font-mono uppercase">UNIVERSITY OF LONDON APPLICATION: 45 DAYS REMAINING</div></div></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"><div className="card"><p className="text-sm text-muted mb-1 font-mono uppercase">TOTAL PRACTICE</p><p className="text-3xl font-bold text-accent-cyan">{stats.total_count}</p></div><div className="card"><p className="text-sm text-muted mb-1 font-mono uppercase">AVERAGE SCORE</p><p className="text-3xl font-bold text-accent-purple">{stats.avg_score > 0 ? formatScore(stats.avg_score) : '--'}</p></div><div className="card"><p className="text-sm text-muted mb-1 font-mono uppercase">LATEST SCORE</p><p className="text-3xl font-bold text-accent-red">{formatScore(stats.latest_score)}</p></div></div>
      <div className="mb-8"><h2 className="text-lg font-semibold text-foreground mb-4 font-mono uppercase">Quick Actions</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Link href="/chat" className="card transition-all hover:shadow-neon-cyan"><h3 className="font-medium text-foreground mb-1 font-mono uppercase">CHAT // INITIATE</h3><p className="text-sm text-muted font-mono">Practice conversational skills</p></Link><Link href="/writing" className="card transition-all hover:shadow-neon-purple"><h3 className="font-medium text-foreground mb-1 font-mono uppercase">WRITING // ANALYZE</h3><p className="text-sm text-muted font-mono">Improve your writing skills</p></Link><Link href="/speaking" className="card transition-all hover:shadow-neon-red"><h3 className="font-medium text-foreground mb-1 font-mono uppercase">SPEAKING // RECORD</h3><p className="text-sm text-muted font-mono">Enhance your speaking abilities</p></Link></div></div>
      <div><h2 className="text-lg font-semibold text-foreground mb-4 font-mono uppercase">RECENT SESSIONS</h2>{recentProgress.length > 0 ? (<div className="card">{recentProgress.map((entry) => (<div key={entry.id} className="flex justify-between items-center p-4 border-b border-border last:border-b-0"><div><p className="font-medium text-foreground font-mono uppercase">{activityLabels[entry.activity_type] || entry.activity_type}</p><p className="text-sm text-muted font-mono">{entry.feedback || 'No feedback'}</p></div><div className="text-right"><p className="text-sm text-muted font-mono">{new Date(entry.created_at).toLocaleDateString()}</p><p className="font-medium text-accent-cyan">{formatScore(entry.score)}</p></div></div>))}</div>) : (<div className="card p-8 text-center"><p className="text-muted mb-4 font-mono uppercase">No sessions yet. Start practicing to track your progress!</p><Link href="/chat" className="btn btn-primary inline-block">START PRACTICE</Link></div>)}</div>
    </div>
  );
}