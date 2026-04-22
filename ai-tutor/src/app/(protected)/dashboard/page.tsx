"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user as { email?: string });
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const stats = [
    { label: "Total Sessions", value: "24" },
    { label: "Hours Practiced", value: "18" },
    { label: "Current Streak", value: "5 days" },
  ];

  const sessions = [
    { type: "Chat", topic: "General Conversation", date: "Today", score: 85 },
    { type: "Writing", topic: "Essay Practice", date: "Yesterday", score: 78 },
    { type: "Speaking", topic: "Pronunciation", date: "2 days ago", score: 92 },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-gray-600">Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
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
        <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
          {sessions.map((session, index) => (
            <div key={index} className="flex justify-between items-center p-4 border-b border-gray-200 last:border-b-0">
              <div>
                <p className="font-medium text-gray-900">{session.type}</p>
                <p className="text-sm text-gray-600">{session.topic}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{session.date}</p>
                <p className="font-medium text-blue-600">{session.score}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}