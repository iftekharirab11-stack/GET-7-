"use client";

import { AuthProvider } from "@/lib/hooks/useAuth";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}