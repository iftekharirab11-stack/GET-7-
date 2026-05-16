"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const { error } = await signUp(email, password);
    if (error) setError(error.message);
    else setMessage("Check your email for the confirmation link!");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="card">
          <h1 className="text-2xl font-bold text-[var(--accent-cyan)] text-center mb-2 font-mono uppercase">CREATE ACCOUNT</h1>
          <p className="text-muted text-center mb-6 font-mono uppercase">Initialize your study abroad mission</p>
          {error && <div className="bg-danger/20 border border-danger text-danger px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
          {message && <div className="bg-success/20 border border-success text-success px-4 py-3 rounded-lg mb-4 text-sm">{message}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium text-foreground mb-1 font-mono uppercase">EMAIL</label><input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1 font-mono uppercase">PASSWORD</label><input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full">{loading ? "PROCESSING..." : "INITIALIZE"}</button>
          </form>
          <p className="mt-6 text-center text-sm text-muted font-mono uppercase">Already enrolled? <Link href="/login" className="text-accent-cyan font-medium hover:underline">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
}

export default function Signup() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="text-accent-cyan">LOADING...</span></div>}><SignupForm /></Suspense>;
}