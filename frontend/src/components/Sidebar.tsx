"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/chat", label: "Chat", icon: "💬" },
    { href: "/history", label: "History", icon: "📚" },
  ];

  return (
    <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col py-4">
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💹</span>
          <span className="font-bold text-white text-lg">FinanceGPT</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">AI Document Q&A</p>
      </div>

      <nav className="flex-1 px-2 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === link.href
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="px-4 pt-4 border-t border-gray-800">
        <p className="text-xs text-gray-600">
          Built with Next.js · FastAPI · LangChain · PostgreSQL
        </p>
      </div>
    </aside>
  );
}
