"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "../ui/Spinner";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { if (!loading && !user) router.push(`/login?redirect=${pathname}`); }, [user, loading, router, pathname]);
  if (loading) return <div className="flex flex-col items-center justify-center min-h-screen gap-3"><Spinner /><p className="text-muted font-mono uppercase">Loading...</p></div>;
  if (!user) return null;
  return <>{children}</>;
}