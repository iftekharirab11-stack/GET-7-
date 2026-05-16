import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";

const supabase = createClient();

export function useProgress() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_count: 0,
    avg_score: 0,
    latest_score: null,
  });
  const [recentProgress, setRecentProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data } = await supabase
        .from("progress")
        .select("score, created_at, id, activity_type, feedback")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (data) {
        setRecentProgress(data.slice(0, 10));
        const scores = data.filter((p) => p.score !== null).map((p) => p.score);
        const total = data.length;
        const avg = scores.length
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : 0;
        setStats({
          total_count: total,
          avg_score: Math.round(avg * 10) / 10,
          latest_score: data[0]?.score || null,
        });
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);
  return { stats, recentProgress, loading };
}
