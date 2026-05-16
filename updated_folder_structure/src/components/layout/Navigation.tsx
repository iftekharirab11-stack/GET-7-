"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

const navLinks = [{ href: "/dashboard", label: "Dashboard", icon: "⚡" }, { href: "/chat", label: "Chat", icon: "💬" }, { href: "/writing", label: "Writing", icon: "✏️" }, { href: "/speaking", label: "Speaking", icon: "🎤" }];

export default function Navigation() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  return (<aside className="fixed left-0 top-0 w-60 h-screen bg-surface/80 backdrop-blur-lg border-r border-border flex flex-col p-4"><div className="mb-8 px-3"><Link href="/" className="text-xl font-bold text-accent-cyan font-mono uppercase tracking-wider">AI TUTOR</Link></div><nav className="flex-1 flex flex-col gap-2">{navLinks.map(link => (<Link key={link.href} href={link.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all font-mono uppercase tracking-wider ${pathname === link.href ? "bg-accent-cyan/20 text-accent-cyan shadow-neon-cyan" : "text-muted hover:bg-surface-elevated hover:text-accent-purple"}`}><span>{link.icon}</span><span>{link.label}</span></Link>))}</nav><div className="pt-4 border-t border-border">{user ? (<button onClick={() => signOut()} className="w-full text-left px-3 py-2 text-sm text-muted hover:bg-surface-elevated rounded-lg font-mono uppercase">Sign Out</button>) : (<Link href="/login" className="block text-center px-3 py-2 text-sm text-muted hover:bg-surface-elevated rounded-lg font-mono uppercase">Sign In</Link>)}</div></aside>);
}