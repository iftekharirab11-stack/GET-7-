import { supabase } from "@/lib/supabaseClient";

export interface ProgressRecord {
  id: string;
  user_id: string;
  activity_type: string;
  score: number | null;
  feedback: string | null;
  created_at: string;
  metadata: Record<string, unknown>;
}

export interface UserStats {
  total_count: number;
  avg_score: number;
  latest_score: number | null;
}

export async function getCurrentUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id || null;
}

export async function fetchUserProgress(userId: string, limit: number = 10): Promise<ProgressRecord[]> {
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch progress:', error);
    return [];
  }

  return data || [];
}

export async function fetchUserStats(userId: string): Promise<UserStats> {
  const { data, error } = await supabase
    .from('progress')
    .select('score, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch stats:', error);
    return { total_count: 0, avg_score: 0, latest_score: null };
  }

  const records = data || [];
  const totalCount = records.length;
  
  const scoresWithValues = records.filter(r => r.score !== null);
  const avgScore = scoresWithValues.length > 0
    ? scoresWithValues.reduce((sum, r) => sum + (r.score || 0), 0) / scoresWithValues.length
    : 0;
  
  const latestScore = records.length > 0 ? records[0].score : null;

  return {
    total_count: totalCount,
    avg_score: Math.round(avgScore * 10) / 10,
    latest_score: latestScore
  };
}

export async function saveProgress(
  userId: string,
  activityType: 'chat' | 'writing' | 'speaking',
  score: number,
  feedback: string,
  metadata?: Record<string, unknown>
): Promise<boolean> {
  const { error } = await supabase.from('progress').insert({
    user_id: userId,
    activity_type: activityType,
    score: score,
    feedback: feedback.substring(0, 500),
    metadata: metadata || {},
  });

  if (error) {
    console.error('Failed to save progress:', error);
    return false;
  }

  return true;
}