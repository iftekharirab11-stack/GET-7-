"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const { signIn, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) setError(error.message);
    else router.push(redirect);
    setLoading(false);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle(redirect);
    if (error) setError(error.message);
    setGoogleLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="card">
          <h1 className="text-2xl font-bold text-[var(--accent-cyan)] text-center mb-2 font-mono uppercase tracking-wider">ACCESS TERMINAL</h1>
          <p className="text-[var(--muted)] text-center mb-6 font-mono uppercase tracking-wider">Continue your IELTS journey</p>
          {error && <div className="bg-danger/20 border border-danger text-danger px-4 py-3 rounded-lg mb-4 text-sm font-mono">{error}</div>}
          <button onClick={handleGoogle} disabled={googleLoading || loading} className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-lg font-medium text-foreground bg-surface hover:bg-surface-elevated transition-all disabled:opacity-50 mb-6 font-mono uppercase">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 12 2.09 12 5.38z" /></svg>
            {googleLoading ? "AUTHENTICATING..." : "GOOGLE SIGN-IN"}
          </button>
          <div className="relative mb-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-surface text-muted font-mono uppercase">OR USE CREDENTIALS</span></div></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium text-foreground mb-1 font-mono uppercase">EMAIL</label><input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1 font-mono uppercase">PASSWORD</label><input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full">{loading ? "PROCESSING..." : "ACCESS GRANTED"}</button>
          </form>
          <p className="mt-6 text-center text-sm text-muted font-mono uppercase">New mission? <Link href="/signup" className="text-accent-cyan font-medium hover:underline">Enroll Now</Link></p>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="text-accent-cyan font-mono uppercase">LOADING...</span></div>}>
      <LoginForm />
    </Suspense>
  );
}