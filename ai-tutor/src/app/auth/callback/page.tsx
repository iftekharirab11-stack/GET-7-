"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

async function ensureProfile(userId: string, userEmail: string | undefined) {
  if (!userId) return;

  // Check if profile exists
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

  // Create profile if doesn't exist
  if (!existing) {
    await supabase.from('profiles').insert({
      id: userId,
      email: userEmail || ''
    });
  }
}

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checking, setChecking] = useState(true);
  const redirect = searchParams.get("redirect") || "/dashboard";

  useEffect(() => {
    async function handleCallback() {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Ensure profile exists
        await ensureProfile(session.user.id, session.user.email);

        router.push(redirect);
      } else {
        router.push("/login");
      }
      setChecking(false);
    }

    handleCallback();
  }, [router, redirect]);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    );
  }

  return <div className="flex items-center justify-center min-h-screen"><p className="text-gray-600">Redirecting...</p></div>;
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <CallbackContent />
    </Suspense>
  );
}