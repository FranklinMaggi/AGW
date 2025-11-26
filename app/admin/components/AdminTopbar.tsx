"use client";

import { ShieldCheck, Wifi, Database, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminTopbar({ token }: { token: string | null }) {
  const router = useRouter();

  function logout() {
    router.push("/admin?token=invalid");
  }

  return (
    <header className="admin-topbar w-full px-6 py-4 flex justify-between items-center shadow-sm">

      {/* LEFT */}
      <div className="flex items-center gap-3">
        <ShieldCheck size={20} className="text-[hsl(var(--agw-gold))]" />
        <h1 className="text-lg font-semibold text-[hsl(var(--agw-gold))] tracking-wide">
          AGW Admin Panel
        </h1>

        <span className="px-2 py-1 text-xs rounded-md bg-[hsl(var(--agw-gold))] text-black ml-2">
          ADMIN
        </span>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-6">

        <div className="flex items-center gap-1 text-neutral-400 text-sm">
          <Wifi size={16} className="text-green-400" />
          Online
        </div>

        <div className="flex items-center gap-1 text-neutral-400 text-sm">
          <Database size={16} className="text-blue-400" />
          KV OK
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-1 rounded-md admin-btn admin-btn-danger hover:opacity-90"
        >
          <LogOut size={16} />
          Logout
        </button>

      </div>

    </header>
  );
}
