"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, BadgeCheck, Target, BarChart3, Settings } from "lucide-react";

export default function AdminSidebar({ token }: { token: string | null }) {
  const pathname = usePathname();

  function link(path: string) {
    return `${path}?token=${token ?? ""}`;
  }

  const items = [
    { label: "Overview", path: "/admin", icon: LayoutDashboard },
    { label: "Users", path: "/admin/users", icon: Users },
    { label: "Subscriptions", path: "/admin/subscriptions", icon: BadgeCheck },
    { label: "Missions", path: "/admin/missions", icon: Target },
    { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
    { label: "System", path: "/admin/system", icon: Settings },
  ];

  return (
    <aside className="w-64 admin-sidebar min-h-screen p-4 space-y-6">
      <h2 className="text-2xl font-bold text-[hsl(var(--agw-gold))]">AGW Admin</h2>

      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={link(item.path)}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-md transition
                ${
                  active
                    ? "bg-[hsl(var(--agw-gold))] text-black font-semibold"
                    : "text-neutral-300 hover:text-white hover:bg-neutral-800"
                }
              `}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
