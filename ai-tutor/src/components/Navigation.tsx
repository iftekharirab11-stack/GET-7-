"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/chat", label: "Chat", icon: "💬" },
  { href: "/writing", label: "Writing", icon: "✏️" },
  { href: "/speaking", label: "Speaking", icon: "🎤" },
];

export default function Navigation() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <aside className="fixed left-0 top-0 w-60 h-screen bg-gray-50 border-r border-gray-200 flex flex-col p-4">
      <div className="mb-8 px-3">
        <Link href="/" className="text-xl font-bold text-gray-900">
          AI Tutor
        </Link>
      </div>
      <nav className="flex-1 flex flex-col gap-2">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === link.href
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
      <div className="pt-4 border-t border-gray-200">
        {user ? (
          <button
            onClick={() => signOut()}
            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg"
          >
            Sign Out
          </button>
        ) : (
          <Link
            href="/login"
            className="block text-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg"
          >
            Sign In
          </Link>
        )}
      </div>
    </aside>
  );
}