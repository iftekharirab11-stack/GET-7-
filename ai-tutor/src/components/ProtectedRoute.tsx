"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import styles from "./ProtectedRoute.module.css";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=${pathname}`);
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.unauthorized}>
        <h1>Access Denied</h1>
        <p>Please sign in to access this page.</p>
        <Link href="/login" className="btn btn-primary">
          Sign In
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}